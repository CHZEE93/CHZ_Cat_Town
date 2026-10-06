import { useFrame } from "@react-three/fiber";
import {
  useBeforePhysicsStep,
  type RapierRigidBody,
} from "@react-three/rapier";
import { type RefObject } from "react";
import { CAMERA, PLAYER_SPEED } from "../config/constants";
import { useTownRuntime } from "../runtime/TownRuntime";
import { useMovementKeys } from "./useMovementKeys";
const horizontalLength = Math.hypot(CAMERA.offset[0], CAMERA.offset[2]);
const sin = CAMERA.offset[0] / horizontalLength,
  cos = CAMERA.offset[2] / horizontalLength;
export function usePlayerMovement(body: RefObject<RapierRigidBody | null>) {
  const runtime = useTownRuntime();
  useMovementKeys();
  useFrame((_, delta) => {
    if (!body.current) return;
    const position = body.current.translation();
    runtime.walking =
      !runtime.blocked &&
      Math.hypot(
        position.x - runtime.position.x,
        position.z - runtime.position.z,
      ) > 0.0001;
    runtime.position.set(position.x, position.y, position.z);
    runtime.elapsed += Math.min(delta, 0.05);
    const held = (a: string, b: string) =>
      Number(runtime.keys.has(a) || runtime.keys.has(b));
    const x = held("KeyD", "ArrowRight") - held("KeyA", "ArrowLeft");
    const z = held("KeyS", "ArrowDown") - held("KeyW", "ArrowUp");
    // Camera-relative axes: W always moves toward the top of the screen.
    runtime.velocity.set(cos * x + sin * z, 0, -sin * x + cos * z);
    if (runtime.blocked) runtime.velocity.set(0, 0, 0);
    else runtime.velocity.normalize().multiplyScalar(PLAYER_SPEED);
    if (runtime.velocity.lengthSq() > 0)
      runtime.facing = Math.atan2(runtime.velocity.x, runtime.velocity.z);
  }, -2);
  // Apply the same velocity to every fixed Rapier step, independent of render FPS.
  useBeforePhysicsStep(() => {
    body.current?.setLinvel(runtime.velocity, true);
  });
}
