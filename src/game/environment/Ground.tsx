import { RoundedBox } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { WORLD } from "../config/constants";
import { THEME } from "../config/theme";
import { Box } from "./Primitives";
export function Ground() {
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[WORLD.width / 2, 0.5, WORLD.depth / 2]}
          position={[0, -0.5, 0]}
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            <CuboidCollider
              args={[0.25, 2, WORLD.depth / 2]}
              position={[(side * WORLD.width) / 2, 1, 0]}
            />
            <CuboidCollider
              args={[WORLD.width / 2, 2, 0.25]}
              position={[0, 1, (side * WORLD.depth) / 2]}
            />
          </group>
        ))}
      </RigidBody>
      <RoundedBox
        args={[WORLD.width, 1, WORLD.depth]}
        position={[0, -0.6, 0]}
        radius={0.5}
        smoothness={2}
        receiveShadow
      >
        <meshStandardMaterial color={THEME.earth} roughness={1} />
      </RoundedBox>
      <RoundedBox
        args={[WORLD.width, 0.25, WORLD.depth]}
        position={[0, -0.13, 0]}
        radius={0.12}
        smoothness={2}
        receiveShadow
      >
        <meshStandardMaterial color={THEME.grass} roughness={1} />
      </RoundedBox>
      <Box
        position={[0, 0.012, 1]}
        size={[3, 0.035, 23]}
        color={THEME.path}
        shadow={false}
      />
      <Box
        position={[0, 0.018, 2.5]}
        size={[23, 0.04, 3]}
        color={THEME.path}
        shadow={false}
      />
      <mesh position={[0, 0.03, 1]} receiveShadow>
        <cylinderGeometry args={[4.3, 4.3, 0.06, 12]} />
        <meshStandardMaterial color={THEME.paving} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <Box
          key={i}
          position={[0.12 * (i % 2), 0.05, 6 + i * 0.95]}
          size={[1.45, 0.06, 0.52]}
          color={THEME.paving}
          shadow={false}
        />
      ))}
    </>
  );
}
