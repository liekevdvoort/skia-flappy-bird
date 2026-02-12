//https://www.youtube.com/watch?v=9F4aICEisVI
import { Canvas, Group, Image, useImage } from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  Easing,
  Extrapolation,
  interpolate,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const GRAVITY = 1000;
const JUMP_FORCE = -500;

const HelloWorld = () => {
  const { width, height } = useWindowDimensions();

  const bg = useImage(require("../assets/sprites/background-day.png"));
  const bird = useImage(require("../assets/sprites/yellowbird-upflap.png"));
  const pipeBottom = useImage(
    require("../assets/sprites/pipe-green-bottom.png"),
  );
  const pipeTop = useImage(require("../assets/sprites/pipe-green-top.png"));
  const base = useImage(require("../assets/sprites/base.png"));

  const pipeX = useSharedValue(width - 50);

  const birdY = useSharedValue(height / 3);
  const birdYVelocity = useSharedValue(0);
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
  const birdOrigin = useDerivedValue(() => {
    return { x: width / 4 + 32, y: birdY.value + 24 };
  });

  const pipeOffset = 0;

  useFrameCallback(({ timeSincePreviousFrame: delta }) => {
    if (delta === null) return;
    birdY.value = birdY.value + (birdYVelocity.value * delta) / 1000;
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * delta) / 1000;
  });

  useEffect(() => {
    pipeX.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 }),
      ),
      -1,
    );

    birdY.value = withTiming(height, { duration: 1000 });
  }, []);

  const gesture = Gesture.Tap().onStart(() => {
    birdYVelocity.value = JUMP_FORCE;
  });

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
            y={pipeOffset - 320}
            x={pipeX}
            width={104}
            height={640}
          />
          <Image
            image={pipeBottom}
            fit={"contain"}
            y={height - 320 + pipeOffset}
            x={pipeX}
            width={104}
            height={640}
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
          <Group
            transform={birdTransform}
            y={birdY}
            x={width / 4 - 32}
            width={64}
            height={48}
            origin={birdOrigin}
          >
            <Image
              image={bird}
              y={birdY}
              x={width / 4 - 32}
              width={64}
              height={48}
              fit={"contain"}
            />
          </Group>
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default HelloWorld;
