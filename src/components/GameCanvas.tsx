import { useAppearance } from "../stores/appearance";
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { TownScene } from "../game/scenes/TownScene";
import { eventBus } from "../game/events/EventBus";
import { useUI } from "../stores/ui";
export function GameCanvas() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const store = useUI.getState();
    const off = [
      eventBus.on("OPEN_BOARD", () => store.open("board")),
      eventBus.on("OPEN_SHOP", () => store.open("shop")),
      eventBus.on("OPEN_PROFILE", () => store.open("profile")),
      eventBus.on("NEARBY", store.setNearby),
      eventBus.on("READY", () => {
        store.setReady();
        eventBus.emit("SET_CAT", useAppearance.getState().catType);
        eventBus.emit("UI_BLOCKED", useUI.getState().modal !== null);
      }),
    ];
    const unsub = useUI.subscribe((state, previous) => {
      if (state.modal !== previous.modal)
        eventBus.emit("UI_BLOCKED", state.modal !== null);
    });
    const offAppearance = useAppearance.subscribe((state, previous) => {
      if (state.catType !== previous.catType)
        eventBus.emit("SET_CAT", state.catType);
    });
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: host.current!,
      backgroundColor: "#a6bb85",
      pixelArt: true,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.NONE,
        width: host.current!.clientWidth,
        height: host.current!.clientHeight,
      },
      physics: { default: "arcade", arcade: { debug: false } },
      scene: [TownScene],
      input: { keyboard: true },
      banner: false,
    });
    const resize = new ResizeObserver(() => {
      if (host.current)
        game.scale.resize(host.current.clientWidth, host.current.clientHeight);
    });
    resize.observe(host.current!);
    return () => {
      resize.disconnect();
      off.forEach((fn) => fn());
      unsub();
      offAppearance();
      game.destroy(true);
    };
  }, []);
  return (
    <div
      className="game-canvas"
      ref={host}
      role="application"
      aria-label="고양이 마을. WASD 또는 방향키로 이동하고 E로 상호작용하세요."
    />
  );
}
