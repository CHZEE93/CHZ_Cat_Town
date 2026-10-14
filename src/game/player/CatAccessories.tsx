import type { Equipment } from "../../types/api";
import { Box, SmoothShape } from "../environment/Primitives";
export function CatAccessories({ equipped }: { equipped: Equipment }) {
  const mailBag = equipped.back === "blue_mailbag";
  return (
    <>
      {equipped.head === "flower_crown" && (
        <group position={[0, 1.48, 0.47]}>
          {Array.from({ length: 5 }, (_, i) => (
            <SmoothShape
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 5) * 0.14,
                0.1,
                Math.sin((i * Math.PI * 2) / 5) * 0.14,
              ]}
              scale={[0.12, 0.07, 0.12]}
              color="#df9ca5"
            />
          ))}
          <SmoothShape
            position={[0, 0.14, 0]}
            scale={[0.07, 0.06, 0.07]}
            color="#ecd094"
          />
        </group>
      )}
      {equipped.neck === "mint_scarf" && (
        <group position={[0, 0.67, 0.39]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.34, 0.075, 12, 32]} />
            <meshStandardMaterial color="#9bbdb0" />
          </mesh>
          <Box
            position={[0.15, -0.16, 0.29]}
            size={[0.13, 0.3, 0.07]}
            color="#8eada1"
          />
        </group>
      )}
      {equipped.head === "straw_hat" && (
        <group
          name="accessory-straw-hat"
          position={[0, 1.62, 0.43]}
          rotation={[0, 0, -0.08]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.63, 0.63, 0.065, 32]} />
            <meshStandardMaterial color="#e6c17b" />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.31, 0.37, 0.29, 32]} />
            <meshStandardMaterial color="#eacb8b" />
          </mesh>
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.367, 0.375, 0.075, 32]} />
            <meshStandardMaterial color="#a36e53" />
          </mesh>
        </group>
      )}
      {equipped.neck === "red_ribbon" && (
        <group name="accessory-red-ribbon" position={[0, 0.64, 0.69]}>
          <SmoothShape
            position={[-0.16, 0, 0]}
            scale={[0.18, 0.13, 0.065]}
            color="#c96670"
          />
          <SmoothShape
            position={[0.16, 0, 0]}
            scale={[0.18, 0.13, 0.065]}
            color="#dd7d87"
          />
          <SmoothShape
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
      {(equipped.back === "tiny_backpack" || mailBag) && (
        <group
          name="accessory-tiny-backpack"
          position={[0, 1.02, -0.25]}
          rotation={[-0.12, 0, 0]}
        >
          <Box
            position={[0, 0.08, 0]}
            size={[0.48, 0.34, 0.43]}
            color={mailBag ? "#729bb0" : "#789878"}
          />
          <Box
            position={[0, 0.27, 0.01]}
            size={[0.5, 0.08, 0.44]}
            color={mailBag ? "#92b6c4" : "#91ae8b"}
          />
          <Box
            position={[0, 0.06, -0.23]}
            size={[0.31, 0.2, 0.08]}
            color={mailBag ? "#aecad2" : "#a2b693"}
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
