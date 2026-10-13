import { useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CatModel } from "../../game/player/CatModel";
import { createRuntime, RuntimeContext } from "../../game/runtime/TownRuntime";
import type { Character } from "../../types/api";
function PreviewCat({ character }: { character: Character }) {
  const runtime = useMemo(createRuntime, []);
  useFrame((_, delta) => {
    runtime.elapsed += Math.min(delta, 0.05);
  });
  return (
    <RuntimeContext.Provider value={runtime}>
      <CatModel catType={character.catType} equipped={character.equipped} />
    </RuntimeContext.Provider>
  );
}
export default function WardrobePreview({
  character,
}: {
  character: Character;
}) {
  return (
    <Canvas
      camera={{ position: [2.6, 1.7, 3.5], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      aria-label="고양이 외형 3D 미리보기"
    >
      <color attach="background" args={["#f2f0e6"]} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 5, 4]} intensity={3} />
      <PreviewCat character={character} />
      <mesh position={[0, -0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 48]} />
        <meshStandardMaterial color="#d4dcc4" />
      </mesh>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0.25, 0]}
      />
    </Canvas>
  );
}
