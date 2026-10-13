import type { Equipment } from "../../types/api";
import { Box, Facet } from "../environment/Primitives";
export function CatAccessories({ equipped }: { equipped: Equipment }) {
  return (
    <>
      {equipped.head === "straw_hat" && (
        <group
          name="accessory-straw-hat"
          position={[0, 1.62, 0.43]}
          rotation={[0, 0, -0.08]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.63, 0.63, 0.065, 12]} />
            <meshStandardMaterial color="#e6c17b" flatShading />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.31, 0.37, 0.29, 10]} />
            <meshStandardMaterial color="#eacb8b" flatShading />
          </mesh>
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.367, 0.375, 0.075, 10]} />
            <meshStandardMaterial color="#a36e53" />
          </mesh>
        </group>
      )}
      {equipped.neck === "red_ribbon" && (
        <group name="accessory-red-ribbon" position={[0, 0.64, 0.69]}>
          <Facet
            position={[-0.16, 0, 0]}
            scale={[0.18, 0.13, 0.065]}
            color="#c96670"
          />
          <Facet
            position={[0.16, 0, 0]}
            scale={[0.18, 0.13, 0.065]}
            color="#dd7d87"
          />
          <Facet
            position={[0, 0, 0.035]}
            scale={[0.075, 0.075, 0.06]}
            color="#ac465a"
          />
          <Box
            position={[-0.06, -0.13, 0]}
            rotation={[0, 0, -0.2]}
            size={[0.085, 0.2, 0.04]}
            color="#c96670"
          />
        </group>
      )}
      {equipped.back === "tiny_backpack" && (
        <group
          name="accessory-tiny-backpack"
          position={[0, 1.02, -0.25]}
          rotation={[-0.12, 0, 0]}
        >
          <Box
            position={[0, 0.08, 0]}
            size={[0.48, 0.34, 0.43]}
            color="#789878"
          />
          <Box
            position={[0, 0.27, 0.01]}
            size={[0.5, 0.08, 0.44]}
            color="#91ae8b"
          />
          <Box
            position={[0, 0.06, -0.23]}
            size={[0.31, 0.2, 0.08]}
            color="#a2b693"
          />
          <Box
            position={[0, 0.14, -0.28]}
            size={[0.065, 0.08, 0.025]}
            color="#e8c783"
          />
        </group>
      )}
    </>
  );
}
