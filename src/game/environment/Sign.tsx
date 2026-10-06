import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { THEME } from "../config/theme";
import type { Vec3 } from "./Primitives";
// Local canvas lettering avoids downloaded fonts/models. Replace with a model sign later.
export function Sign({
  text,
  position,
  width = 2,
}: {
  text: string;
  position: Vec3;
  width?: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = THEME.cream;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = THEME.ink;
    ctx.font = "600 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 66);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [text]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position}>
      <planeGeometry args={[width, width / 4]} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  );
}
