import Phaser from "phaser";
import { CAT_TYPES } from "../config/cats";
export function createCatTexture(scene: Phaser.Scene) {
  for (const cat of CAT_TYPES) {
    const key = `cat-${cat.id}`;
    if (scene.textures.exists(key)) return;
    const canvas = scene.textures.createCanvas(key, 24 * 12, 32)!;
    const ctx = canvas.context;
    for (let frame = 0; frame < 12; frame++) {
      const ox = frame * 24,
        step = frame % 3,
        direction = Math.floor(frame / 3);
      const rect = (
        x: number,
        y: number,
        w: number,
        h: number,
        color: string,
      ) => {
        ctx.fillStyle = color;
        ctx.fillRect(ox + x, y, w, h);
      };
      rect(3, 27, 18, 3, "#63754f55");
      rect(5, 13, 14, 13, cat.dark);
      rect(4, 5, 5, 10, cat.dark);
      rect(15, 5, 5, 10, cat.dark);
      rect(5, 6, 3, 4, "#e9a3a1");
      rect(16, 6, 3, 4, "#e9a3a1");
      rect(4, 10, 16, 11, cat.base);
      rect(7, 21, 10, 5, cat.base);
      rect(7, 26, 4, step === 1 ? 4 : 2, cat.mark);
      rect(14, 26, 4, step === 2 ? 4 : 2, cat.mark);
      rect(direction === 2 ? 19 : 2, 20, 3, 7, cat.base);
      rect(10, 10, 2, 4, cat.mark);
      rect(14, 10, 2, 3, cat.mark);
      if (cat.id === "calico") {
        rect(4, 11, 6, 7, cat.mark);
        rect(15, 10, 5, 8, "#424148");
        rect(14, 22, 4, 4, cat.mark);
      }
      if (cat.id === "tuxedo") {
        rect(9, 19, 6, 7, cat.mark);
        rect(7, 26, 4, 2, cat.mark);
        rect(14, 26, 4, 2, cat.mark);
      }
      if (cat.id === "tabby") {
        rect(5, 21, 4, 2, cat.mark);
        rect(15, 23, 4, 2, cat.mark);
        rect(4, 17, 3, 2, cat.mark);
        rect(17, 17, 3, 2, cat.mark);
      }
      if (direction !== 1) {
        rect(direction === 2 ? 5 : 8, 15, 2, 3, cat.eyes);
        if (direction !== 2)
          rect(direction === 3 ? 18 : 15, 15, 2, 3, cat.eyes);
        rect(11, 19, 3, 2, "#b56d61");
        rect(9, 21, 6, 2, "#fff0cd");
      }
    }
    canvas.refresh();
    for (let i = 0; i < 12; i++) canvas.add(i, 0, i * 24, 0, 24, 32);
    ["down", "up", "left", "right"].forEach((direction, index) =>
      scene.anims.create({
        key: `${key}-walk_${direction}`,
        frames: scene.anims.generateFrameNumbers(key, {
          start: index * 3,
          end: index * 3 + 2,
        }),
        frameRate: 8,
        repeat: -1,
      }),
    );
  }
}
