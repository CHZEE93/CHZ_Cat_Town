import { PCFShadowMap } from "three";
import { GameError } from "./GameError";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CatTownWorld } from "../game/world/CatTownWorld";
import { THEME } from "../game/config/theme";
export default function TownCanvas({ active }: { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
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
      <Suspense fallback={null}>
        <CatTownWorld active={active} />
      </Suspense>
    </Canvas>
  );
}
