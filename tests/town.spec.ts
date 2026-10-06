import { test, expect, type Page } from "@playwright/test";
import type { TownSnapshot } from "../src/game/dev/Diagnostics";
const COS = 21 / Math.hypot(13, 21),
  SIN = 13 / Math.hypot(13, 21);
async function snapshot(page: Page): Promise<TownSnapshot> {
  return page.evaluate(() => window.__CHZ_TOWN__!());
}
async function boot(page: Page) {
  await page.goto("/?debug=1");
  await page.waitForFunction(
    () => Boolean(window.__CHZ_TOWN__),
    {},
    { timeout: 60000 },
  );
  await expect(page.getByText("마을의 문을 여는 중…")).toBeHidden();
}
// Drive real keyboard input from read-only world coordinates. No teleport/test input API.
async function steer(page: Page, x: number, z: number, ms = 110) {
  const p = (await snapshot(page)).position;
  const dx = x - p.x,
    dz = z - p.z;
  const right = COS * dx - SIN * dz,
    down = SIN * dx + COS * dz;
  const keys: string[] = [];
  if (Math.abs(right) > Math.abs(down) * 0.414)
    keys.push(right > 0 ? "d" : "a");
  if (Math.abs(down) > Math.abs(right) * 0.414) keys.push(down > 0 ? "s" : "w");
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  for (const key of keys) await page.keyboard.up(key);
}
async function walkTo(page: Page, x: number, z: number) {
  for (let i = 0; i < 100; i++) {
    const p = (await snapshot(page)).position;
    const distance = Math.hypot(p.x - x, p.z - z);
    if (distance < 0.38) return;
    await steer(
      page,
      x,
      z,
      Math.min(120, Math.max(25, (distance / 4.8) * 650)),
    );
  }
  throw new Error(
    `Could not reach ${x},${z}: ${JSON.stringify(await snapshot(page))}`,
  );
}
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}
test("3D movement, solid board, modal blocking and all community interactions", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await boot(page);
  const cameraBefore = (await snapshot(page)).camera;
  await walkTo(page, -3, 5);
  await walkTo(page, -3, -2.7);
  await walkTo(page, 0, -2.7);
  await expect(page.getByRole("status")).toContainText("게시판 보기");
  for (let i = 0; i < 10; i++) await steer(page, 0, -6);
  const blockedAt = (await snapshot(page)).position;
  expect(blockedAt.z).toBeGreaterThan(-4.1);
  expect(blockedAt.z).toBeLessThan(-3.5);
  expect(
    Math.abs((await snapshot(page)).camera.z - cameraBefore.z),
  ).toBeGreaterThan(2);
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("Cat Board");
  const before = (await snapshot(page)).position;
  await page.keyboard.down("w");
  await page.waitForTimeout(350);
  await page.keyboard.up("w");
  expect(
    Math.hypot(
      (await snapshot(page)).position.x - before.x,
      (await snapshot(page)).position.z - before.z,
    ),
  ).toBeLessThan(0.03);
  await page.getByRole("button", { name: /오늘 처음 왔어요/ }).click();
  await expect(
    page.getByText("작고 포근한 마을이네요. 앞으로 잘 부탁해요!"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await walkTo(page, -2.3, -3.5);
  await walkTo(page, -2.3, -7);
  await walkTo(page, 0, -7);
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("Orange Cat");
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await walkTo(page, 3.5, -7);
  await walkTo(page, 5, -3);
  await walkTo(page, 6.2, 3);
  await walkTo(page, 10, 3);
  await expect(page.getByRole("status")).toContainText("상점 둘러보기");
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("발바닥 쿠션");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.screenshot({ path: "test-results/3d-town.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("fullscreen, resize, 6 cat models and persisted appearance", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await boot(page);
  await page.getByRole("button", { name: /전체화면/ }).click();
  await expect(page.locator(".app")).toHaveClass(/is-fullscreen/);
  await expect
    .poll(async () =>
      page.locator("canvas").evaluate((c) => c.getBoundingClientRect().width),
    )
    .toBe(1440);
  await page.getByRole("button", { name: "고양이 선택", exact: true }).click();
  const cats = [
    ["삼색고양이", "calico"],
    ["턱시도고양이", "tuxedo"],
    ["고등어고양이", "tabby"],
    ["검은고양이", "black"],
    ["흰고양이", "white"],
    ["치즈고양이", "orange"],
  ];
  for (const [name, id] of cats) {
    const option = page.getByRole("button", { name: new RegExp(name) });
    await option.click();
    await expect(option).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => (await snapshot(page)).catType).toBe(id);
  }
  await page.getByRole("button", { name: /삼색고양이/ }).click();
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page.screenshot({ path: "test-results/3d-fullscreen.png" });
  await page.getByRole("button", { name: /전체화면 나가기/ }).click();
  await expect(page.locator(".app")).not.toHaveClass(/is-fullscreen/);
  await page.setViewportSize({ width: 760, height: 900 });
  await expect
    .poll(async () =>
      page
        .locator("canvas")
        .evaluate((c) => Math.round(c.getBoundingClientRect().width)),
    )
    .toBe(672);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__CHZ_TOWN__));
  await expect.poll(async () => (await snapshot(page)).catType).toBe("calico");
  await page.getByRole("button", { name: "고양이 선택", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Calico Cat");
  await page.screenshot({ path: "test-results/3d-narrow.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("normalized arrow-key movement, blur release, tree and house collision", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await boot(page);
  await page.keyboard.down("ArrowUp");
  await expect
    .poll(async () => (await snapshot(page)).velocity.z)
    .toBeLessThan(-1);
  const straight = (await snapshot(page)).velocity;
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(100);
  const diagonal = (await snapshot(page)).velocity;
  expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(
    Math.hypot(straight.x, straight.z),
    4,
  );
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect
    .poll(async () =>
      Math.hypot(
        ...[
          (await snapshot(page)).velocity.x,
          (await snapshot(page)).velocity.z,
        ],
      ),
    )
    .toBe(0);
  await page.keyboard.up("ArrowUp");
  await page.keyboard.up("ArrowRight");
  await walkTo(page, 5, 7);
  await walkTo(page, 8, 7.8);
  for (let i = 0; i < 10; i++) await steer(page, 8, 9);
  const treePosition = (await snapshot(page)).position;
  // The capsule may slide along a trunk corner: measure separation from its box.
  const trunkDistance = Math.hypot(
    Math.max(Math.abs(treePosition.x - 8) - 0.28, 0),
    Math.max(Math.abs(treePosition.z - 9) - 0.28, 0),
  );
  expect(trunkDistance).toBeGreaterThan(0.31);
  expect(treePosition.z).toBeLessThan(8.75);
  await walkTo(page, 6, 6);
  await walkTo(page, 6, -4);
  await walkTo(page, 3.5, -7);
  await walkTo(page, 0, -7);
  for (let i = 0; i < 10; i++) await steer(page, 0, -10);
  expect((await snapshot(page)).position.z).toBeGreaterThan(-7.95);
  expect((await snapshot(page)).position.z).toBeLessThan(-7.5);
  expect(errors).toEqual([]);
});
