import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { THEME } from "../config/theme";
import { Box } from "./Primitives";
export function Plaza() {
  return (
    <group position={[0, 0, 1]}>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.5, 1.48]} position={[0, 0.5, 0]} />
      </RigidBody>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.55, 1.65, 0.44, 12]} />
        <meshStandardMaterial color={THEME.stone} flatShading />
      </mesh>
      <mesh position={[0, 0.47, 0]} receiveShadow>
        <cylinderGeometry args={[1.34, 1.34, 0.12, 12]} />
        <meshStandardMaterial color={THEME.water} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.57, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.45, 0.13, 4, 12]} />
        <meshStandardMaterial color={THEME.cream} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.23, 1.05, 8]} />
        <meshStandardMaterial color={THEME.stone} />
      </mesh>
      <mesh position={[0, 1.44, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.36, 0.22, 10]} />
        <meshStandardMaterial color={THEME.cream} />
      </mesh>
      <mesh position={[0, 1.57, 0]}>
        <cylinderGeometry args={[0.54, 0.54, 0.05, 10]} />
        <meshStandardMaterial color={THEME.water} />
      </mesh>
      <mesh position={[0, 1.73, 0]}>
        <sphereGeometry args={[0.15, 6, 4]} />
        <meshStandardMaterial color={THEME.water} />
      </mesh>
      <Box
        position={[-3, 0.08, 0]}
        size={[0.45, 0.15, 1.1]}
        color={THEME.stone}
        shadow={false}
      />
    </group>
  );
}
