import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Object3D } from "three";
import { useTownRuntime } from "../runtime/TownRuntime";

export function TownLighting() {
  const group = useRef<Group>(null);
  const target = useMemo(() => new Object3D(), []);
  const runtime = useTownRuntime();
  useFrame(() => {
    if (group.current)
      group.current.position.set(runtime.position.x, 0, runtime.position.z);
  });
  // Keep a detailed shadow area around the player as they explore the larger map.
  return (
    <group ref={group}>
      <primitive object={target} />
      <directionalLight
        position={[-10, 22, 12]}
        target={target}
        intensity={2.5}
        color="#fff2d7"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-far={85}
        shadow-normalBias={0.045}
        shadow-bias={-0.0001}
      />
    </group>
  );
}
