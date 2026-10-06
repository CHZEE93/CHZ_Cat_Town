import type { ThreeElements } from "@react-three/fiber";
export type Vec3 = [number, number, number];
type BoxProps = {
  position?: Vec3;
  size: Vec3;
  color: string;
  rotation?: Vec3;
  shadow?: boolean;
} & Pick<ThreeElements["mesh"], "name">;
export function Box({
  position,
  size,
  color,
  rotation,
  shadow = true,
  name,
}: BoxProps) {
  return (
    <mesh
      name={name}
      position={position}
      rotation={rotation}
      castShadow={shadow}
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  );
}
export function Facet({
  position,
  scale,
  color,
  detail = 0,
}: {
  position?: Vec3;
  scale: Vec3;
  color: string;
  detail?: number;
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <icosahedronGeometry args={[1, detail]} />
      <meshStandardMaterial color={color} flatShading roughness={1} />
    </mesh>
  );
}
