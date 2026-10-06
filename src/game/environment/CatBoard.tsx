import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { BOARD_POSITION } from "../config/constants";
import { THEME } from "../config/theme";
import { Box } from "./Primitives";
import { Sign } from "./Sign";
export function CatBoard() {
  return (
    <group position={[BOARD_POSITION.x, 0, BOARD_POSITION.z]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.3, 1.25, 0.24]} position={[0, 1.25, 0]} />
      </RigidBody>
      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[side * 0.95, 0.75, 0]}
          size={[0.15, 1.5, 0.18]}
          color={THEME.wood}
        />
      ))}
      <Box position={[0, 1.6, 0]} size={[2.5, 1.3, 0.22]} color={THEME.wood} />
      <Box
        position={[0, 1.6, 0.13]}
        size={[2.2, 1.02, 0.08]}
        color={THEME.earth}
      />
      <Box
        position={[0, 2.32, 0]}
        size={[2.8, 0.18, 0.52]}
        color={THEME.roof}
      />
      {[-0.65, 0, 0.66].map((x, i) => (
        <Box
          key={x}
          position={[x, 1.54, 0.2]}
          rotation={[0, 0, (i - 1) * 0.07]}
          size={[0.47, 0.6, 0.035]}
          color={i === 1 ? THEME.pink : THEME.cream}
        />
      ))}
      <Sign text="CAT BOARD" position={[0, 2.65, 0]} width={2} />
    </group>
  );
}
