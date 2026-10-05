import Phaser from "phaser";
import { PLAYER_SPEED } from "../config/constants";
import type { CatType } from "../config/cats";
export type Direction = "up" | "down" | "left" | "right";
export class CatPlayer extends Phaser.Physics.Arcade.Sprite {
  catType: CatType = "orange";
  setCatType(catType: CatType) {
    this.catType = catType;
    this.anims.stop();
    this.setTexture(
      `cat-${catType}`,
      { down: 0, up: 3, left: 6, right: 9 }[this.direction],
    );
  }
  direction: Direction = "down";
  state: "idle" | `walk_${Direction}` = "idle";
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "cat-orange", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(2).setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setSize(12, 9).setOffset(6, 20);
  }
  move(x: number, y: number) {
    const velocity = new Phaser.Math.Vector2(x, y)
      .normalize()
      .scale(PLAYER_SPEED);
    this.setVelocity(velocity.x, velocity.y);
    if (x || y) {
      this.direction = x < 0 ? "left" : x > 0 ? "right" : y < 0 ? "up" : "down";
      this.state = `walk_${this.direction}`;
      this.play(`cat-${this.catType}-${this.state}`, true);
    } else {
      this.state = "idle";
      this.anims.stop();
      this.setFrame({ down: 0, up: 3, left: 6, right: 9 }[this.direction]);
    }
    this.setDepth(this.y);
  }
}
