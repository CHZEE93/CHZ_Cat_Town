import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PLACES, type Interactable } from "../config/constants";
import { eventBus } from "../events/EventBus";
import { useTownRuntime } from "../runtime/TownRuntime";
export function useInteraction() {
  const runtime = useTownRuntime();
  const nearest = useRef<Interactable | null>(null);
  useFrame(() => {
    let next: Interactable | null = null;
    let min = Infinity;
    for (const place of PLACES) {
      const distance = Math.hypot(
        place.position.x - runtime.position.x,
        place.position.z - runtime.position.z,
      );
      if (distance < place.interactionRadius && distance < min) {
        min = distance;
        next = place;
      }
    }
    if (nearest.current?.id !== next?.id) {
      nearest.current = next;
      eventBus.emit("NEARBY", next);
    }
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.code !== "KeyE" ||
        event.repeat ||
        runtime.blocked ||
        !nearest.current
      )
        return;
      eventBus.emit(
        (
          {
            board: "OPEN_BOARD",
            shop: "OPEN_SHOP",
            profile: "OPEN_PROFILE",
          } as const
        )[nearest.current.type],
        undefined,
      );
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      nearest.current = null;
      eventBus.emit("NEARBY", null);
    };
  }, [runtime]);
}
