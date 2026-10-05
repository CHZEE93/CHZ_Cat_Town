import Phaser from "phaser";
import { CatPlayer } from "../entities/CatPlayer";
import { eventBus } from "../events/EventBus";
import { PLACES, SPAWN, WORLD, type Interactable } from "../config/constants";
import { buildTown } from "../world/buildTown";
import { createCatTexture } from "../world/catTexture";
export class TownScene extends Phaser.Scene {
  private player!: CatPlayer;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private blocked = false;
  private nearby: Interactable | null = null;
  constructor() {
    super("Town");
  }
  create() {
    createCatTexture(this);
    const solids = buildTown(this);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.player = new CatPlayer(this, SPAWN.x, SPAWN.y);
    this.physics.add.collider(this.player, solids);
    this.cameras.main
      .setBounds(0, 0, WORLD.width, WORLD.height)
      .startFollow(this.player, true, 0.08, 0.08);
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,E",
      false,
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    const offCat = eventBus.on("SET_CAT", (catType) =>
      this.player.setCatType(catType),
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, offCat);
    this.events.once(Phaser.Scenes.Events.DESTROY, offCat);
    const unsubscribe = eventBus.on("UI_BLOCKED", (blocked) => {
      this.blocked = blocked;
      this.player.move(0, 0);
      this.input.keyboard?.resetKeys();
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
    this.events.once(Phaser.Scenes.Events.DESTROY, unsubscribe);
    this.input.keyboard!.on("keydown-E", (event: KeyboardEvent) => {
      if (this.blocked || !this.nearby || event.repeat) return;
      eventBus.emit(
        (
          {
            board: "OPEN_BOARD",
            shop: "OPEN_SHOP",
            profile: "OPEN_PROFILE",
          } as const
        )[this.nearby.type],
        undefined,
      );
    });
    eventBus.emit("READY", undefined);
  }
  update() {
    if (!this.player) return;
    const down = (key: string) => this.keys[key].isDown;
    this.player.move(
      this.blocked
        ? 0
        : Number(down("D") || down("RIGHT")) -
            Number(down("A") || down("LEFT")),
      this.blocked
        ? 0
        : Number(down("S") || down("DOWN")) - Number(down("W") || down("UP")),
    );
    const nearby =
      PLACES.filter(
        (p) =>
          Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            p.position.x,
            p.position.y,
          ) < p.interactionRadius,
      ).sort(
        (a, b) =>
          Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            a.position.x,
            a.position.y,
          ) -
          Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            b.position.x,
            b.position.y,
          ),
      )[0] ?? null;
    if (nearby?.id !== this.nearby?.id) {
      this.nearby = nearby;
      eventBus.emit("NEARBY", nearby);
    }
  }
}
