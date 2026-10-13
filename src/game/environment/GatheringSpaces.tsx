import { GATHERING_SPOTS } from "../config/constants";
import { THEME } from "../config/theme";
import { TownBench } from "./Details";
import { Box, SmoothShape } from "./Primitives";
import { Sign } from "./Sign";

export function GatheringSpaces() {
  return (
    <>
      {GATHERING_SPOTS.map((spot) => (
        <group key={spot.title} position={[spot.x, 0, spot.z]}>
          <mesh position={[0, 0.035, 0]} receiveShadow>
            <cylinderGeometry args={[spot.radius, spot.radius, 0.055, 48]} />
            <meshStandardMaterial color={THEME.paving} roughness={1} />
          </mesh>
          <mesh position={[0, 0.07, 0]} receiveShadow>
            <cylinderGeometry
              args={[spot.radius - 0.65, spot.radius - 0.65, 0.025, 48]}
            />
            <meshStandardMaterial color={THEME.grass} roughness={1} />
          </mesh>
          <TownBench x={-4} z={3.8} rotation={-0.45} />
          <TownBench x={4} z={3.8} rotation={0.45} />
          <TownBench x={0} z={-4.8} rotation={Math.PI} />
          {[-1, 1].map((side) => (
            <group key={side} position={[side * (spot.radius - 1), 0, -1.5]}>
              <Box
                position={[0, 0.22, 0]}
                size={[1.5, 0.44, 1.1]}
                color={THEME.wood}
              />
              <SmoothShape
                position={[0, 0.65, 0]}
                scale={[0.85, 0.55, 0.7]}
                color={THEME.foliage}
              />
            </group>
          ))}
          <group position={[0, 0, spot.radius + 0.4]}>
            <Box
              position={[0, 0.7, 0]}
              size={[0.12, 1.4, 0.12]}
              color={THEME.wood}
            />
            <Sign text={spot.title} position={[0, 1.5, 0]} width={2.5} />
          </group>
        </group>
      ))}
    </>
  );
}
