import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useTownRuntime } from "../runtime/TownRuntime";
// Read-only development telemetry for real-keyboard browser regression tests.
// No teleport, input injection, or production debugging API.
export interface TownSnapshot {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
  walking: boolean;
  blocked: boolean;
  catType: string;
  drawCalls: number;
}
declare global {
  interface Window {
    __CHZ_TOWN__?: () => TownSnapshot;
  }
}
export function Diagnostics() {
  const runtime = useTownRuntime();
  const { camera, gl } = useThree();
  useEffect(() => {
    if (
      !import.meta.env.DEV ||
      new URLSearchParams(location.search).get("debug") !== "1"
    )
      return;
    const snapshot = () => ({
      position: {
        x: runtime.position.x,
        y: runtime.position.y,
        z: runtime.position.z,
      },
      velocity: {
        x: runtime.velocity.x,
        y: runtime.velocity.y,
        z: runtime.velocity.z,
      },
      camera: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
      walking: runtime.walking,
      blocked: runtime.blocked,
      catType: runtime.catType,
      drawCalls: gl.info.render.calls,
    });
    window.__CHZ_TOWN__ = snapshot;
    return () => {
      if (window.__CHZ_TOWN__ === snapshot) delete window.__CHZ_TOWN__;
    };
  }, [runtime, camera, gl]);
  return null;
}
