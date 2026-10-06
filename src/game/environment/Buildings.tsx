import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { THEME } from "../config/theme";
import { Box } from "./Primitives";
import { Sign } from "./Sign";
export interface BuildingProps {
  x: number;
  z: number;
  width: number;
  depth: number;
  shop?: boolean;
  title: string;
}
export function Building({
  x,
  z,
  width,
  depth,
  shop = false,
  title,
}: BuildingProps) {
  const roof = shop ? THEME.shopRoof : THEME.roof;
  return (
    <group position={[x, 0, z]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[width / 2, 1.6, depth / 2]}
          position={[0, 1.6, 0]}
        />
      </RigidBody>
      <Box
        position={[0, 1.4, 0]}
        size={[width, 2.8, depth]}
        color={THEME.wall}
      />
      <Box
        position={[0, 0.15, 0]}
        size={[width + 0.18, 0.3, depth + 0.18]}
        color={THEME.stone}
      />
      <mesh
        position={[0, 3.25, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[width * 0.84, 1, depth * 0.94]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1, 1.5, 4]} />
        <meshStandardMaterial color={roof} flatShading roughness={1} />
      </mesh>
      <Box
        position={[0, 2.64, 0]}
        size={[width + 0.5, 0.18, depth + 0.5]}
        color={roof}
      />
      <Box
        position={[width * 0.28, 3.3, -depth * 0.22]}
        size={[0.48, 1.1, 0.48]}
        color={THEME.wall}
      />
      <Box
        position={[width * 0.28, 3.88, -depth * 0.22]}
        size={[0.62, 0.18, 0.62]}
        color={THEME.stone}
      />
      <Box
        position={[0, 0.88, depth / 2 + 0.045]}
        size={[0.92, 1.7, 0.12]}
        color={THEME.wood}
      />
      <Box
        position={[0, 1.15, depth / 2 + 0.12]}
        size={[0.64, 0.65, 0.08]}
        color={THEME.window}
      />
      <mesh position={[0.3, 0.72, depth / 2 + 0.15]}>
        <sphereGeometry args={[0.05, 6, 4]} />
        <meshStandardMaterial color={THEME.cream} />
      </mesh>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * width * 0.32, 1.35, depth / 2 + 0.06]}
        >
          <Box size={[0.92, 1.02, 0.12]} color={THEME.wood} />
          <Box
            position={[0, 0, 0.08]}
            size={[0.73, 0.8, 0.07]}
            color={THEME.window}
          />
          <Box
            position={[0, 0, 0.13]}
            size={[0.06, 0.85, 0.03]}
            color={THEME.cream}
          />
          <Box
            position={[0, 0, 0.13]}
            size={[0.76, 0.06, 0.03]}
            color={THEME.cream}
          />
          <Box
            position={[0, -0.64, 0.1]}
            size={[1.1, 0.26, 0.4]}
            color={THEME.wood}
          />
          <Box
            position={[0, -0.47, 0.1]}
            size={[0.9, 0.12, 0.32]}
            color={THEME.foliage}
          />
        </group>
      ))}
      <Sign text={title} position={[0, 2.25, depth / 2 + 0.07]} width={1.95} />
      <Box
        position={[0, 0.06, depth / 2 + 0.4]}
        size={[1.7, 0.12, 0.8]}
        color={THEME.paving}
      />
      {shop && (
        <group position={[0, 1.95, depth / 2 + 0.45]} rotation={[0.15, 0, 0]}>
          {Array.from({ length: 7 }, (_, i) => (
            <Box
              key={i}
              position={[(i - 3) * 0.58, 0, 0]}
              size={[0.58, 0.12, 1.15]}
              color={i % 2 ? THEME.cream : THEME.canopy}
            />
          ))}
        </group>
      )}
    </group>
  );
}
