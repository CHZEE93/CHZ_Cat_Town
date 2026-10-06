import { GameError } from "./GameError";
import {
  Component,
  lazy,
  Suspense,
  useLayoutEffect,
  type ReactNode,
} from "react";
import { useAppearance } from "../stores/appearance";
import { eventBus } from "../game/events/EventBus";
import { useUI } from "../stores/ui";
const TownCanvas = lazy(() => import("./TownCanvas"));
class WorldBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useUI.getState().setReady();
  }
  render() {
    return this.state.failed ? <GameError /> : this.props.children;
  }
}
export function GameCanvas() {
  useLayoutEffect(() => {
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
    const offUI = useUI.subscribe((state, previous) => {
      if (state.modal !== previous.modal)
        eventBus.emit("UI_BLOCKED", state.modal !== null);
    });
    const offAppearance = useAppearance.subscribe((state, previous) => {
      if (state.catType !== previous.catType)
        eventBus.emit("SET_CAT", state.catType);
    });
    return () => {
      off.forEach((fn) => fn());
      offUI();
      offAppearance();
    };
  }, []);
  return (
    <div
      className="game-canvas"
      role="application"
      aria-label="3D 고양이 마을. WASD 또는 방향키로 이동하고 E로 상호작용하세요."
    >
      <WorldBoundary>
        <Suspense fallback={null}>
          <TownCanvas />
        </Suspense>
      </WorldBoundary>
    </div>
  );
}
