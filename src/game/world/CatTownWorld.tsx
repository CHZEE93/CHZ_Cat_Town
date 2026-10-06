import { useEffect, useMemo, useState } from "react";
import { Physics } from "@react-three/rapier";
import {
  createRuntime,
  RuntimeContext,
  useTownRuntime,
} from "../runtime/TownRuntime";
import { eventBus } from "../events/EventBus";
import type { CatType } from "../config/cats";
import { BUILDINGS } from "../config/constants";
import { Ground } from "../environment/Ground";
import { Trees } from "../environment/Trees";
import { Building } from "../environment/Buildings";
import { CatHouse } from "../environment/CatHouse";
import { CatShop } from "../environment/CatShop";
import { CatBoard } from "../environment/CatBoard";
import { Plaza } from "../environment/Plaza";
import { Details } from "../environment/Details";
import { CatPlayer } from "../player/CatPlayer";
import { FollowCamera } from "../camera/FollowCamera";
import { useInteraction } from "../interaction/useInteraction";
import { Diagnostics } from "../dev/Diagnostics";
function TownContents() {
  const runtime = useTownRuntime();
  const [catType, setCatType] = useState<CatType>("orange");
  useInteraction();
  useEffect(() => {
    const offBlocked = eventBus.on("UI_BLOCKED", (blocked) => {
      runtime.blocked = blocked;
      runtime.keys.clear();
      runtime.velocity.set(0, 0, 0);
    });
    const offCat = eventBus.on("SET_CAT", (value) => {
      runtime.catType = value;
      setCatType(value);
    });
    eventBus.emit("READY", undefined);
    return () => {
      offBlocked();
      offCat();
    };
  }, [runtime]);
  return (
    <>
      <Ground />
      <Trees />
      <Building {...BUILDINGS.neighbor} title="LITTLE HOME" />
      <CatHouse />
      <CatShop />
      <CatBoard />
      <Plaza />
      <Details />
      <CatPlayer catType={catType} />
      <FollowCamera />
      {import.meta.env.DEV && <Diagnostics />}
    </>
  );
}
export function CatTownWorld() {
  const runtime = useMemo(createRuntime, []);
  return (
    <RuntimeContext.Provider value={runtime}>
      <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} colliders={false}>
        <TownContents />
      </Physics>
    </RuntimeContext.Provider>
  );
}
