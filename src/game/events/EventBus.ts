import type { CatType } from "../config/cats";
import type { Interactable } from "../config/constants";
type Events = {
  SET_CAT: CatType;
  OPEN_BOARD: undefined;
  OPEN_SHOP: undefined;
  OPEN_PROFILE: undefined;
  UI_BLOCKED: boolean;
  NEARBY: Interactable | null;
  READY: undefined;
};
class EventBus {
  private target = new EventTarget();
  emit<K extends keyof Events>(name: K, detail: Events[K]) {
    this.target.dispatchEvent(new CustomEvent(name, { detail }));
  }
  on<K extends keyof Events>(name: K, handler: (value: Events[K]) => void) {
    const listener = (event: Event) =>
      handler((event as CustomEvent<Events[K]>).detail);
    this.target.addEventListener(name, listener);
    return () => this.target.removeEventListener(name, listener);
  }
}
export const eventBus = new EventBus();
