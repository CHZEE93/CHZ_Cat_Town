import { PCFShadowMap } from "three";
import { GameError } from "./GameError";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CatTownWorld } from "../game/world/CatTownWorld";
import { THEME } from "../game/config/theme";
export default function TownCanvas() {
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [13, 18, 28], fov: 43 }}
      fallback={<GameError />}
    >
      <color attach="background" args={[THEME.background]} />
      <hemisphereLight args={["#fff7e4", "#c3cbb3", 2.1]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[-10, 22, 12]}
        intensity={2.5}
        color="#fff2d7"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-far={65}
        shadow-normalBias={0.045}
        shadow-bias={-0.0001}
      />
      <Suspense fallback={null}>
        <CatTownWorld />
      </Suspense>
    </Canvas>
  );
}
