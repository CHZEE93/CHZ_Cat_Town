import { useEffect, useMemo, useState } from "react";
import { Physics } from "@react-three/rapier";
import {
  createRuntime,
  RuntimeContext,
  useTownRuntime,
} from "../runtime/TownRuntime";
import { eventBus } from "../events/EventBus";
import type { CatType } from "../config/cats";
import { BUILDINGS, NEIGHBORHOOD } from "../config/constants";
import { Ground } from "../environment/Ground";
import { Trees } from "../environment/Trees";
import { Building } from "../environment/Buildings";
import { CatHouse } from "../environment/CatHouse";
import { CatShop } from "../environment/CatShop";
import { CatBoard } from "../environment/CatBoard";
import { Plaza } from "../environment/Plaza";
import { Details } from "../environment/Details";
import { GatheringSpaces } from "../environment/GatheringSpaces";
import { TownLighting } from "../environment/TownLighting";
import { CatPlayer } from "../player/CatPlayer";
import { FollowCamera } from "../camera/FollowCamera";
import { useInteraction } from "../interaction/useInteraction";
import { Diagnostics } from "../dev/Diagnostics";
import type { Equipment } from "../../types/api";
function TownContents() {
  const runtime = useTownRuntime();
  const [catType, setCatType] = useState<CatType>("orange");
  const [equipped, setEquipped] = useState<Equipment>({
    head: null,
    neck: null,
    back: null,
  });
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
    const offEquipment = eventBus.on("SET_EQUIPMENT", (value) => {
      runtime.equipped = value;
      setEquipped(value);
    });
    eventBus.emit("READY", undefined);
    return () => {
      offBlocked();
      offCat();
      offEquipment();
    };
  }, [runtime]);
  return (
    <>
      <TownLighting />
      <Ground />
      <Trees />
      <Building {...BUILDINGS.neighbor} title="LITTLE HOME" />
      {NEIGHBORHOOD.map((house) => (
        <Building
          key={`${house.x},${house.z}`}
          {...house}
          title="LITTLE HOME"
        />
      ))}
      <CatHouse />
      <CatShop />
      <CatBoard />
      <Plaza />
      <Details />
      <GatheringSpaces />
      <CatPlayer catType={catType} equipped={equipped} />
      <FollowCamera />
      {import.meta.env.DEV && <Diagnostics />}
    </>
  );
}
export function CatTownWorld({ active }: { active: boolean }) {
  const runtime = useMemo(createRuntime, []);
  return (
    <RuntimeContext.Provider value={runtime}>
      <Physics
        paused={!active}
        gravity={[0, -9.81, 0]}
        timeStep={1 / 60}
        colliders={false}
      >
        <TownContents />
      </Physics>
    </RuntimeContext.Provider>
  );
}
