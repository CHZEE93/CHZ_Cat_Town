import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Instance, Instances } from "@react-three/drei";
import { GATHERING_SPOTS } from "../config/constants";
import { THEME } from "../config/theme";
import { Box } from "./Primitives";
const FLOWERS: [number, number, number][] = [
  ...Array.from({ length: 55 }, (_, i): [number, number, number] => {
    const side = i % 2 ? 1 : -1;
    return [side * (5 + ((i * 1.37) % 9)), 0.16, 4 + ((i * 1.61) % 8)];
  }),
  ...GATHERING_SPOTS.flatMap((spot) =>
    Array.from({ length: 40 }, (_, i): [number, number, number] => {
      const angle = (i * Math.PI * 2) / 40;
      const radius = spot.radius + 0.7 + (i % 3) * 0.2;
      return [
        spot.x + Math.cos(angle) * radius,
        0.16,
        spot.z + Math.sin(angle) * radius,
      ];
    }),
  ),
];
export function TownBench({
  x,
  z,
  rotation = 0,
}: {
  x: number;
  z: number;
  rotation?: number;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.95, 0.6, 0.4]} position={[0, 0.6, 0]} />
      </RigidBody>
      <Box position={[0, 0.55, 0]} size={[1.9, 0.18, 0.6]} color={THEME.wood} />
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
  );
}
export function Details() {
  return (
    <>
      <Instances limit={FLOWERS.length} receiveShadow>
        <sphereGeometry args={[0.14, 12, 8]} />
        <meshStandardMaterial roughness={1} />
        {FLOWERS.map((position, i) => (
          <Instance
            key={i}
            position={position}
            color={i % 3 ? THEME.cream : THEME.flower}
          />
        ))}
      </Instances>
      {[-1, 1].map((side) => (
        <TownBench key={side} x={side * 4.4} z={3.7} rotation={side * -0.25} />
      ))}
    </>
  );
}
