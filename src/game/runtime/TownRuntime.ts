import { createContext, useContext } from "react";
import { Vector3 } from "three";
import { SPAWN } from "../config/constants";
export function createRuntime() {
  return {
    position: new Vector3(SPAWN.x, SPAWN.y, SPAWN.z),
    velocity: new Vector3(),
    walking: false,
    facing: 0,
    blocked: false,
    keys: new Set<string>(),
    catType: "orange",
    elapsed: 0,
  };
}
export type TownRuntime = ReturnType<typeof createRuntime>;
export const RuntimeContext = createContext<TownRuntime | null>(null);
export function useTownRuntime() {
  const runtime = useContext(RuntimeContext);
  if (!runtime) throw new Error("Town runtime missing");
  return runtime;
}
