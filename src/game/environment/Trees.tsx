import { Instance, Instances } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { TREES } from "../config/constants";
import { THEME } from "../config/theme";
export function Trees() {
  return (
    <>
      <Instances limit={TREES.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.27, 1.9, 6]} />
        <meshStandardMaterial color={THEME.wood} />
        {TREES.map(([x, z], i) => (
          <Instance key={i} position={[x, 0.95, z]} />
        ))}
      </Instances>
      <Instances limit={TREES.length * 3} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={1} />
        {TREES.flatMap(([x, z], i) => [
          <Instance
            key={`${i}a`}
            position={[x, 2.65, z]}
            scale={[1.35, 1.45, 1.2]}
            rotation={[0, i * 0.7, 0]}
            color={i % 3 === 0 ? THEME.foliageLight : THEME.foliage}
          />,
          <Instance
            key={`${i}b`}
            position={[x - 0.65, 2.05, z + 0.1]}
            scale={[0.92, 0.95, 0.85]}
            color={THEME.foliageDark}
          />,
          <Instance
            key={`${i}c`}
            position={[x + 0.65, 2.25, z + 0.2]}
            scale={[0.9, 1, 0.85]}
            color={THEME.foliageLight}
          />,
        ])}
      </Instances>
      {TREES.map(([x, z], i) => (
        <RigidBody type="fixed" colliders={false} position={[x, 0, z]} key={i}>
          <CuboidCollider args={[0.28, 1, 0.28]} position={[0, 1, 0]} />
        </RigidBody>
      ))}
    </>
  );
}
