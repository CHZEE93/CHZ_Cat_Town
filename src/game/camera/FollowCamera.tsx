import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { PerspectiveCamera as ThreeCamera, Vector3 } from "three";
import { CAMERA, SPAWN } from "../config/constants";
import { useTownRuntime } from "../runtime/TownRuntime";
export function FollowCamera() {
  const camera = useRef<ThreeCamera>(null);
  const runtime = useTownRuntime();
  const target = useMemo(() => new Vector3(SPAWN.x, 0.6, SPAWN.z - 2), []);
  useFrame((state, delta) => {
    if (!camera.current) return;
    // Partial following keeps nearby landmarks in view; orientation never rotates.
    const amount = 1 - Math.exp(-CAMERA.follow * Math.min(delta, 0.1));
    target.x += (runtime.position.x * 0.65 - target.x) * amount;
    target.z += (runtime.position.z * 0.65 - 2 - target.z) * amount;
    // Narrow screens pull back instead of cropping the player and nearby buildings.
    const distanceScale = state.size.width / state.size.height < 1.1 ? 1.28 : 1;
    camera.current.position.set(
      target.x + CAMERA.offset[0] * distanceScale,
      target.y + CAMERA.offset[1] * distanceScale,
      target.z + CAMERA.offset[2] * distanceScale,
    );
    camera.current.lookAt(target);
  });
  return (
    <PerspectiveCamera
      ref={camera}
      makeDefault
      fov={CAMERA.fov}
      near={0.1}
      far={120}
      position={[
        CAMERA.offset[0],
        CAMERA.offset[1],
        CAMERA.offset[2] + SPAWN.z,
      ]}
    />
  );
}
