import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Instance, Instances } from "@react-three/drei";
import { THEME } from "../config/theme";
import { Box } from "./Primitives";
const FLOWERS = Array.from({ length: 55 }, (_, i) => {
  const side = i % 2 ? 1 : -1;
  return [side * (5 + ((i * 1.37) % 9)), 0.16, 4 + ((i * 1.61) % 8)] as [
    number,
    number,
    number,
  ];
});
export function Details() {
  return (
    <>
      <Instances limit={FLOWERS.length} receiveShadow>
        <icosahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial roughness={1} />
        {FLOWERS.map((p, i) => (
          <Instance
            key={i}
            position={p}
            color={i % 3 ? THEME.cream : THEME.flower}
          />
        ))}
      </Instances>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 4.4, 0, 3.7]}
          rotation={[0, side * -0.25, 0]}
        >
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[0.95, 0.6, 0.4]} position={[0, 0.6, 0]} />
          </RigidBody>
          <Box
            position={[0, 0.55, 0]}
            size={[1.9, 0.18, 0.6]}
            color={THEME.wood}
          />
          <Box
            position={[0, 0.98, -0.3]}
            size={[1.9, 0.55, 0.14]}
            color={THEME.wood}
          />
          {[-0.68, 0.68].map((x) => (
            <Box
              key={x}
              position={[x, 0.25, 0]}
              size={[0.12, 0.5, 0.5]}
              color={THEME.metal}
            />
          ))}
        </group>
      ))}
    </>
  );
}
