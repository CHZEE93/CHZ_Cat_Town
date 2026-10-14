import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  CuboidCollider,
  RigidBody,
} from "@react-three/rapier";
import { REWARD_PLACES } from "../config/rewards";
import { CatModel } from "../player/CatModel";
import { createRuntime, RuntimeContext } from "../runtime/TownRuntime";
import { Box } from "./Primitives";
import { Sign } from "./Sign";
function NeighborCat({ postman }: { postman: boolean }) {
  const runtime = useMemo(createRuntime, []);
  useFrame((_, delta) => {
    runtime.elapsed += Math.min(delta, 0.05);
  });
  return (
    <RuntimeContext.Provider value={runtime}>
      <RigidBody type="fixed" colliders={false} position={[0, 0.5, 0]}>
        <CapsuleCollider args={[0.2, 0.28]} />
      </RigidBody>
      <group position={[0, 0.5, 0]}>
        <CatModel
          catType={postman ? "white" : "tuxedo"}
          scale={0.8}
          equipped={{
            head: postman ? "straw_hat" : null,
            neck: postman ? null : "red_ribbon",
            back: postman ? "tiny_backpack" : null,
          }}
        />
      </group>
      <Sign
        text={postman ? "POST CAT" : "SHOP CAT"}
        position={[0, 2.1, 0]}
        width={2}
      />
    </RuntimeContext.Provider>
  );
}
export function RewardStations() {
  return (
    <>
      {REWARD_PLACES.map((place) => (
        <group
          key={place.id}
          position={[place.position.x, 0, place.position.z]}
        >
          {place.kind === "postman" || place.kind === "merchant" ? (
            <NeighborCat postman={place.kind === "postman"} />
          ) : (
            <>
              <RigidBody type="fixed" colliders={false}>
                <CuboidCollider
                  args={[0.3, 0.65, 0.25]}
                  position={[0, 0.65, 0]}
                />
              </RigidBody>
              <Box
                position={[0, 0.4, 0]}
                size={[0.14, 0.8, 0.14]}
                color="#a08a68"
              />
              <Box
                position={[0, 1, 0]}
                size={[0.6, 0.5, 0.5]}
                color={
                  place.kind === "stamp"
                    ? "#98b58a"
                    : place.kind === "mailbox"
                      ? "#b77f70"
                      : "#ceb580"
                }
              />
              <Box
                position={[0, 1.08, 0.26]}
                size={[0.38, 0.06, 0.02]}
                color="#faf2d9"
              />
              <Sign
                text={
                  place.kind === "stamp"
                    ? "STAMP"
                    : place.kind === "mailbox"
                      ? "MAIL"
                      : "DELIVERY"
                }
                position={[0, 1.65, 0]}
                width={1.5}
              />
            </>
          )}
        </group>
      ))}
    </>
  );
}
