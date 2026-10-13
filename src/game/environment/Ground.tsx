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
              args={[WORLD.boundary, 2, WORLD.depth / 2 + WORLD.boundary]}
              position={[(side * WORLD.width) / 2, 1, 0]}
            />
            <CuboidCollider
              args={[WORLD.width / 2 + WORLD.boundary, 2, WORLD.boundary]}
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
        size={[4, 0.035, 56]}
        color={THEME.path}
        shadow={false}
      />
      <Box
        position={[0, 0.018, 2.5]}
        size={[68, 0.04, 4]}
        color={THEME.path}
        shadow={false}
      />
      <mesh position={[0, 0.03, 1]} receiveShadow>
        <cylinderGeometry args={[5.8, 5.8, 0.06, 48]} />
        <meshStandardMaterial color={THEME.paving} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            position={[side * 32, 0.012, 0]}
            size={[3, 0.035, 54]}
            color={THEME.path}
            shadow={false}
          />
          <Box
            position={[0, 0.012, side * 27]}
            size={[64, 0.035, 3]}
            color={THEME.path}
            shadow={false}
          />
        </group>
      ))}
      <Box
        position={[24, 0.012, -5]}
        size={[3, 0.035, 18]}
        color={THEME.path}
        shadow={false}
      />
      <mesh position={[0, 0.025, 21]} receiveShadow>
        <cylinderGeometry args={[7.5, 7.5, 0.035, 48]} />
        <meshStandardMaterial color={THEME.foliageLight} roughness={1} />
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
