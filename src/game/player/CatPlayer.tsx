import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTownRuntime } from "../runtime/TownRuntime";
import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { PLAYER_RADIUS, SPAWN } from "../config/constants";
import type { CatType } from "../config/cats";
import { usePlayerMovement } from "./usePlayerMovement";
import { CatModel } from "./CatModel";
import type { Equipment } from "../../types/api";
export function CatPlayer({
  catType,
  equipped,
  scale,
}: {
  catType: CatType;
  equipped: Equipment;
  scale: number;
}) {
  const body = useRef<RapierRigidBody>(null);
  const runtime = useTownRuntime();
  useFrame(() => {
    // Rapier creates/disposes bodies in effects; update only after the body is live.
    if (!body.current?.isValid()) return;
    const position = body.current.translation();
    if (Math.abs(position.y - SPAWN.y * scale) > 0.0001)
      body.current.setTranslation({ ...position, y: SPAWN.y * scale }, true);
    runtime.scale = scale;
    if (body.current.numColliders())
      runtime.colliderRadius = body.current.collider(0).radius();
  }, -3);
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
      <CapsuleCollider
        key={scale}
        args={[0.26 * scale, PLAYER_RADIUS * scale]}
        friction={0}
      />
      <CatModel catType={catType} equipped={equipped} scale={scale} />
    </RigidBody>
  );
}
