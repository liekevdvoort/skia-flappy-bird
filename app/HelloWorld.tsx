//https://www.youtube.com/watch?v=9F4aICEisVI
import {
  Canvas,
  Circle,
  Group,
  Image,
  matchFont,
  Text,
  useImage,
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const GRAVITY = 1000;
const JUMP_FORCE = -500;
const PIPE_WIDTH = 104;
const PIPE_HEIGHT = 640;
const PIPE_GAP = 320;

const HelloWorld = () => {
  const { width, height } = useWindowDimensions();
  const pipeOffset = 0;
  const birdPosition = {
    x: width / 4,
  };

  const bg = useImage(require("../assets/sprites/background-day.png"));
  const bird = useImage(require("../assets/sprites/yellowbird-upflap.png"));
  const pipeBottom = useImage(
    require("../assets/sprites/pipe-green-bottom.png"),
  );
  const pipeTop = useImage(require("../assets/sprites/pipe-green-top.png"));
  const base = useImage(require("../assets/sprites/base.png"));

  const score = useSharedValue(0);
  const gameOver = useSharedValue(false);
  const pipeX = useSharedValue(width);
  const birdY = useSharedValue(height / 3);
  const birdYVelocity = useSharedValue(0);

  const birdOrigin = useDerivedValue(() => {
    return { x: birdPosition.x + 32, y: birdY.value + 24 };
  });

  const birdOriginX = useDerivedValue(() => birdPosition.x + 32);
  const birdOriginY = useDerivedValue(() => birdY.value + 24);
  const obstacles = useDerivedValue(() => {
    const allObstacles = [];
    // add Top pipe
    allObstacles.push({
      x: pipeX.value,
      y: pipeOffset - PIPE_GAP,
      height: PIPE_HEIGHT,
      width: PIPE_WIDTH,
    });
    // add Bottom pipe
    allObstacles.push({
      x: pipeX.value,
      y: height - PIPE_GAP + pipeOffset,
      height: PIPE_HEIGHT,
      width: PIPE_WIDTH,
    });
    return allObstacles;
  });

  const birdTransform = useDerivedValue(() => {
    return [
      {
        rotate: interpolate(
          birdYVelocity.value,
          [-500, 500],
          [-0.5, 0.5],
          Extrapolation.CLAMP,
        ),
      },
    ];
  });

  useEffect(() => {
    moveTheMap();
  }, []);

  const moveTheMap = () => {
    "worklet";
    pipeX.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 }),
      ),
      -1,
    );
    birdY.value = withTiming(height, { duration: 1000 });
  };

  useFrameCallback(({ timeSincePreviousFrame: delta }) => {
    if (delta === null || gameOver.value) return;
    birdY.value = birdY.value + (birdYVelocity.value * delta) / 1000;
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * delta) / 1000;
  });

  const restartGame = () => {
    "worklet";
    birdY.value = height / 3;
    birdYVelocity.value = 0;
    score.value = 0;
    gameOver.value = false;
    pipeX.value = width;
    moveTheMap();
  };

  const gesture = Gesture.Tap().onStart(() => {
    if (gameOver.value) {
      // Restart
      restartGame();
    } else {
      // Jump
      birdYVelocity.value = JUMP_FORCE;
    }
  });

  // scoring system
  useAnimatedReaction(
    () => {
      return pipeX.value;
    },
    (currentValue, previousValue) => {
      const threshold = birdPosition.x;
      if (!previousValue) return;
      if (
        currentValue !== previousValue &&
        currentValue <= threshold &&
        previousValue > threshold
      ) {
        score.value = score.value + 1;
      }
    },
  );

  const isPointCollidingWithRect = (point, rect) => {
    "worklet";
    if (
      point.x >= rect.x && // to the right of the left edge AND
      point.x <= rect.x + rect.width && // to the left of the right edge AND
      point.y >= rect.y && // below the top of the bottom pipe AND
      point.y <= rect.y + rect.height // above the bottom of the bottom pipe
    ) {
      return true;
    }
    return false;
  };

  // collision detection
  useAnimatedReaction(
    () => {
      return birdY.value;
    },
    (currentValue, previousValue) => {
      // Ground or ceiling collision detection
      if (currentValue > height - 170 || currentValue < 0) {
        gameOver.value = true;
      }

      const isColliding = obstacles.value.some((rect) =>
        isPointCollidingWithRect(
          { x: birdOriginX.value, y: birdOriginY.value },
          rect,
        ),
      );
      if (isColliding) {
        gameOver.value = true;
      }
    },
  );

  useAnimatedReaction(
    () => {
      return gameOver.value;
    },
    (currentValue, previousValue) => {
      if (currentValue && !previousValue) {
        cancelAnimation(pipeX);
      }
    },
  );

  const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
  const fontStyle = {
    fontFamily,
    fontSize: 64,
    fontStyle: "regular",
    fontWeight: "bold",
  };
  const font = matchFont(fontStyle);
  const scoreText = useDerivedValue(() => `${score.value}`);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height }}>
          {/* BG */}
          <Image image={bg} fit={"cover"} width={width} height={height} />
          {/* Pipes */}
          <Image
            image={pipeTop}
            fit={"contain"}
            y={pipeOffset - PIPE_GAP}
            x={pipeX}
            width={PIPE_WIDTH}
            height={PIPE_HEIGHT}
          />
          <Image
            image={pipeBottom}
            fit={"contain"}
            y={height - PIPE_GAP + pipeOffset}
            x={pipeX}
            width={PIPE_WIDTH}
            height={PIPE_HEIGHT}
          />
          {/* Base */}
          <Image
            image={base}
            fit={"cover"}
            y={height - 130}
            x={0}
            width={width}
            height={200}
          />

          {/* Bird */}
          <Group transform={birdTransform} origin={birdOrigin}>
            <Image
              image={bird}
              y={birdY}
              x={birdPosition.x}
              width={64}
              height={48}
              fit={"contain"}
            />
          </Group>
          {/* Simulation */}
          <Circle cy={birdOriginY} cx={birdOriginX} r={5} color={"red"} />

          {/* Score */}
          <Text
            x={width / 2 - 40}
            y={fontStyle.fontSize}
            text={scoreText}
            font={font}
          />
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default HelloWorld;
