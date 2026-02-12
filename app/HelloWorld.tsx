//https://www.youtube.com/watch?v=9F4aICEisVI
import { Canvas, Image, useImage } from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions } from "react-native";

const HelloWorld = () => {
  const { width, height } = useWindowDimensions();

  const bg = useImage(require("../assets/sprites/background-day.png"));
  const bird = useImage(require("../assets/sprites/yellowbird-upflap.png"));
  const pipeBottom = useImage(
    require("../assets/sprites/pipe-green-bottom.png"),
  );
  const pipeTop = useImage(require("../assets/sprites/pipe-green-top.png"));
  const base = useImage(require("../assets/sprites/base.png"));

  const pipeOffset = 0;

  return (
    <Canvas style={{ width, height }}>
      {/* BG */}
      <Image image={bg} fit={"cover"} width={width} height={height} />
      {/* Pipes */}
      <Image
        image={pipeTop}
        fit={"contain"}
        y={pipeOffset - 320}
        x={0}
        width={104}
        height={640}
      />
      <Image
        image={pipeBottom}
        fit={"contain"}
        y={height - 320 + pipeOffset}
        x={0}
        width={104}
        height={640}
      />
      {/* Base */}
      <Image
        image={base}
        fit={"cover"}
        y={height - 150}
        x={0}
        width={width}
        height={200}
      />

      {/* Bird */}
      <Image
        image={bird}
        y={height / 2 - 24}
        x={width / 4 - 32}
        width={64}
        height={48}
        fit={"contain"}
      />
    </Canvas>
  );
};

export default HelloWorld;
