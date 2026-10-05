import Phaser from "phaser";
import { WORLD } from "../config/constants";
export function buildTown(scene: Phaser.Scene) {
  const solids = scene.physics.add.staticGroup();
  const block = (x: number, y: number, w: number, h: number) => {
    const zone = scene.add.zone(x, y, w, h);
    solids.add(zone);
  };
  const g = scene.add.graphics().setDepth(-10);
  const rect = (x: number, y: number, w: number, h: number, c: number) =>
    g.fillStyle(c).fillRect(x, y, w, h);
  rect(0, 0, WORLD.width, WORLD.height, 0xa6bb85);
  const random = new Phaser.Math.RandomDataGenerator(["chz-town"]);
  for (let i = 0; i < 2600; i++) {
    const x = random.between(0, 1280),
      y = random.between(0, 960);
    rect(x, y, 3, 2, random.pick([0x96ad78, 0xb5c792, 0xa0b67f]));
  }
  rect(574, 190, 132, 630, 0xdfcda7);
  rect(240, 520, 800, 112, 0xdfcda7);
  g.fillStyle(0xe9dabb).fillRoundedRect(472, 438, 336, 242, 80);
  for (let i = 0; i < 300; i++) {
    const x = random.between(245, 1030),
      y = random.between(530, 622);
    rect(x, y, random.between(2, 6), 2, 0xd2bf99);
  }
  function label(x: number, y: number, text: string) {
    scene.add
      .text(x, y, text, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#47533c",
        backgroundColor: "#f9f1d9",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(y + 10);
  }
  function house(x: number, y: number, roof: number, title: string, w = 150) {
    const h = scene.add.graphics().setDepth(y + 90);
    h.fillStyle(0x67764b, 0.18).fillEllipse(x + 5, y + 94, w + 36, 28);
    h.fillStyle(0xf4e6c4).fillRect(x - w / 2, y - 4, w, 98);
    h.fillStyle(0xdac99f).fillRect(x - w / 2, y + 84, w, 12);
    h.fillStyle(roof)
      .fillRect(x - w / 2 - 12, y - 36, w + 24, 42)
      .fillRect(x - w / 2, y - 55, w, 20)
      .fillRect(x - w / 2 + 16, y - 66, w - 32, 12);
    h.lineStyle(2, 0xffffff, 0.14);
    for (let row = 0; row < 3; row++)
      h.lineBetween(x - w / 2, y - 48 + row * 18, x + w / 2, y - 48 + row * 18);
    h.fillStyle(0x7d6149).fillRect(x - 17, y + 42, 34, 52);
    h.fillStyle(0xb08d63).fillRect(x - 12, y + 46, 24, 48);
    for (const dx of [-48, 48]) {
      h.fillStyle(0x8b7959).fillRect(x + dx - 15, y + 20, 30, 31);
      h.fillStyle(0xb6d6cc).fillRect(x + dx - 11, y + 24, 22, 23);
      h.fillStyle(0xf3e8c9)
        .fillRect(x + dx - 1, y + 24, 3, 23)
        .fillRect(x + dx - 11, y + 34, 22, 3);
    }
    block(x, y + 38, w, 106);
    label(x, y - 86, title);
  }
  house(640, 140, 0xb57d65, "CAT HOUSE");
  house(960, 475, 0x6f9390, "CAT SHOP", 174);
  house(305, 460, 0xbc9970, "NEIGHBORHOOD");
  // Central fountain, with a solid stone basin.
  g.fillStyle(0xc0bd9e).fillEllipse(640, 564, 138, 74);
  g.fillStyle(0xf0e8ce).fillEllipse(640, 554, 132, 70);
  g.fillStyle(0x79b7b5).fillEllipse(640, 549, 110, 48);
  rect(634, 506, 12, 43, 0xe3e0c5);
  g.fillStyle(0xeae6cf).fillEllipse(640, 516, 63, 23);
  g.fillStyle(0x9ccfca).fillEllipse(640, 512, 49, 13);
  rect(638, 491, 4, 20, 0xb9e6db);
  block(640, 552, 120, 55);
  const b = scene.add.graphics().setDepth(380);
  b.fillStyle(0x856244)
    .fillRect(609, 360, 8, 42)
    .fillRect(664, 360, 8, 42)
    .fillRect(600, 325, 80, 53);
  b.fillStyle(0xc8a170).fillRect(605, 330, 70, 42);
  b.fillStyle(0xf4ecd4).fillRect(612, 336, 22, 25).fillRect(642, 338, 25, 18);
  b.fillStyle(0xa46d56).fillRect(596, 319, 88, 8);
  block(640, 365, 82, 34);
  label(640, 295, "CAT BOARD");
  function tree(x: number, y: number) {
    const t = scene.add.graphics().setDepth(y);
    t.fillStyle(0x6f7e4b, 0.2).fillEllipse(x, y + 4, 69, 24);
    t.fillStyle(0x8b7350).fillRect(x - 7, y - 33, 14, 40);
    t.fillStyle(0x557e58)
      .fillRect(x - 26, y - 65, 52, 37)
      .fillRect(x - 35, y - 54, 70, 24);
    t.fillStyle(0x6e9564)
      .fillRect(x - 26, y - 73, 51, 33)
      .fillRect(x - 16, y - 83, 32, 15);
    t.fillStyle(0x88a772).fillRect(x - 17, y - 74, 27, 10);
    block(x, y - 4, 25, 23);
  }
  for (let x = 80; x < 1250; x += 82) {
    tree(x, 105);
    tree(x, 920);
  }
  for (let y = 200; y < 900; y += 95) {
    tree(78, y);
    tree(1204, y);
  }
  [
    [430, 300],
    [490, 285],
    [800, 280],
    [855, 306],
    [355, 750],
    [405, 795],
    [892, 754],
    [987, 801],
    [220, 320],
    [1040, 300],
  ].forEach(([x, y]) => tree(x, y));
  for (let i = 0; i < 65; i++) {
    const x = random.between(160, 1110),
      y = random.between(680, 870);
    if (Math.abs(x - 640) < 100) continue;
    rect(x, y, 3, 8, 0x729064);
    rect(x - 2, y, 7, 3, random.pick([0xf7e6aa, 0xf0c4b5, 0xe8eed2]));
  }
  label(640, 836, "a little place to belong");
  return solids;
}
