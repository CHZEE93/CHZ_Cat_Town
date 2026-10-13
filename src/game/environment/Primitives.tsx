import { RoundedBox } from "@react-three/drei";
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
    <RoundedBox
      args={size}
      radius={Math.min(0.065, Math.min(...size) * 0.2)}
      smoothness={2}
      bevelSegments={2}
      name={name}
      position={position}
      rotation={rotation}
      castShadow={shadow}
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.88} />
    </RoundedBox>
  );
}
export function SmoothShape({
  position,
  scale,
  color,
}: {
  position?: Vec3;
  scale: Vec3;
  color: string;
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
