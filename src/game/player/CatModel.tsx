import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { CAT_TYPES, type CatType } from "../config/cats";
import { Box, Facet } from "../environment/Primitives";
import { useTownRuntime } from "../runtime/TownRuntime";
export function CatModel({ catType }: { catType: CatType }) {
  const cat = CAT_TYPES.find((item) => item.id === catType)!;
  const group = useRef<Group>(null),
    body = useRef<Group>(null),
    tail = useRef<Group>(null);
  const legs = useRef<(Group | null)[]>([]);
  const runtime = useTownRuntime();
  useFrame((_, delta) => {
    if (!group.current || !body.current || !tail.current) return;
    const difference =
      MathUtils.euclideanModulo(
        runtime.facing - group.current.rotation.y + Math.PI,
        Math.PI * 2,
      ) - Math.PI;
    group.current.rotation.y +=
      difference * (1 - Math.exp(-14 * Math.min(delta, 0.1)));
    const phase = runtime.elapsed * 12;
    body.current.position.y = runtime.walking
      ? Math.sin(phase * 2) * 0.035
      : Math.sin(runtime.elapsed * 2) * 0.012;
    legs.current.forEach((leg, index) => {
      if (leg)
        leg.rotation.x = runtime.walking
          ? Math.sin(phase + (index === 0 || index === 3 ? 0 : Math.PI)) * 0.45
          : 0;
    });
    tail.current.rotation.z = Math.sin(runtime.elapsed * 3) * 0.15;
  });
  return (
    <group ref={group} position={[0, -0.62, 0]} name={`cat-${catType}`}>
      <group ref={body}>
        <Facet
          position={[0, 0.65, -0.08]}
          scale={[0.43, 0.47, 0.68]}
          color={cat.base}
          detail={1}
        />
        <Facet
          position={[0, 1.02, 0.47]}
          scale={[0.54, 0.5, 0.47]}
          color={cat.base}
          detail={1}
        />
        {[-1, 1].map((side) => (
          <group
            key={side}
            position={[side * 0.32, 1.46, 0.43]}
            rotation={[0, 0, side * -0.12]}
          >
            <mesh castShadow scale={[1, 1, 0.65]}>
              <coneGeometry args={[0.24, 0.5, 3]} />
              <meshStandardMaterial color={cat.base} flatShading />
            </mesh>
            <mesh position={[0, 0.01, 0.115]} scale={[0.55, 0.65, 0.2]}>
              <coneGeometry args={[0.24, 0.5, 3]} />
              <meshStandardMaterial color="#d99e9e" flatShading />
            </mesh>
          </group>
        ))}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.21, 1.07, 0.879]}
            scale={[1, 1.35, 0.6]}
          >
            <sphereGeometry args={[0.055, 8, 6]} />
            <meshStandardMaterial color={cat.eyes} />
          </mesh>
        ))}
        <Facet
          position={[0, 0.84, 0.87]}
          scale={[0.25, 0.14, 0.1]}
          color={catType === "black" ? cat.dark : "#f8e9d2"}
          detail={1}
        />
        <Facet
          position={[0, 0.95, 0.944]}
          scale={[0.062, 0.045, 0.032]}
          color="#be8283"
        />
        {catType === "calico" && (
          <>
            <Facet
              position={[-0.29, 1.19, 0.7]}
              scale={[0.23, 0.2, 0.14]}
              color={cat.mark}
              detail={1}
            />
            <Facet
              position={[0.35, 0.94, 0.64]}
              scale={[0.16, 0.24, 0.23]}
              color="#44454b"
              detail={1}
            />
            <Facet
              position={[0.33, 0.72, -0.3]}
              scale={[0.16, 0.3, 0.3]}
              color={cat.mark}
              detail={1}
            />
          </>
        )}
        {catType === "tuxedo" && (
          <Facet
            position={[0, 0.65, 0.47]}
            scale={[0.3, 0.3, 0.2]}
            color={cat.mark}
            detail={1}
          />
        )}
        {(catType === "tabby" || catType === "orange") && (
          <>
            {[-0.2, 0, 0.2].map((x) => (
              <Box
                key={x}
                position={[x, 1.4, 0.62]}
                rotation={[-0.35, 0, 0]}
                size={[0.065, 0.08, 0.19]}
                color={cat.mark}
              />
            ))}
            {[-0.4, -0.1, 0.2].map((z) => (
              <Box
                key={z}
                position={[0, 1.06, z]}
                size={[0.45, 0.025, 0.07]}
                color={cat.mark}
              />
            ))}
          </>
        )}
        <group ref={tail} position={[0, 0.74, -0.62]} rotation={[-0.55, 0, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.62, 7]} />
            <meshStandardMaterial color={cat.base} />
          </mesh>
          <Facet
            position={[0, 0.58, 0.04]}
            scale={[0.11, 0.17, 0.12]}
            color={catType === "calico" ? cat.dark : cat.base}
            detail={1}
          />
        </group>
      </group>
      {([-1, 1] as const).flatMap((side, i) =>
        [-0.4, 0.32].map((z, j) => (
          <group
            key={`${side}${z}`}
            ref={(node) => {
              legs.current[i * 2 + j] = node;
            }}
            position={[side * 0.25, 0.4, z]}
          >
            <mesh position={[0, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.11, 0.12, 0.38, 7]} />
              <meshStandardMaterial color={cat.base} />
            </mesh>
            <Facet
              position={[0, -0.31, 0.055]}
              scale={[0.14, 0.1, 0.18]}
              color={catType === "tuxedo" ? cat.mark : cat.base}
              detail={1}
            />
          </group>
        )),
      )}
    </group>
  );
}
