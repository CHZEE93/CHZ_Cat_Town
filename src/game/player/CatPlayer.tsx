import { useRef } from "react";
import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { PLAYER_RADIUS, SPAWN } from "../config/constants";
import type { CatType } from "../config/cats";
import { usePlayerMovement } from "./usePlayerMovement";
import { CatModel } from "./CatModel";
export function CatPlayer({ catType }: { catType: CatType }) {
  const body = useRef<RapierRigidBody>(null);
  usePlayerMovement(body);
  return (
    <RigidBody
      ref={body}
      position={[SPAWN.x, SPAWN.y, SPAWN.z]}
      type="dynamic"
      colliders={false}
      enabledRotations={[false, false, false]}
      enabledTranslations={[true, false, true]}
      gravityScale={0}
      linearDamping={0}
      friction={0}
      restitution={0}
      ccd
      canSleep={false}
    >
      <CapsuleCollider args={[0.26, PLAYER_RADIUS]} friction={0} />
      <CatModel catType={catType} />
    </RigidBody>
  );
}
