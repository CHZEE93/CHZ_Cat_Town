import { test, expect } from "@playwright/test";
test("walk through town and interact with every destination", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByText("마을의 문을 여는 중…")).toBeHidden();
  const walk = async (key: string, ms: number) => {
    await page.keyboard.down(key);
    await page.waitForTimeout((ms * 140) / 175);
    await page.keyboard.up(key);
    await page.waitForTimeout(150);
  };
  // Walk west of the fountain, then approach the board from the south-west.
  await walk("a", 850);
  await walk("ArrowUp", 2200);
  await walk("d", 800);
  await expect(page.getByRole("status")).toContainText("게시판 보기");
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("Cat Board");
  await page.getByRole("button", { name: /오늘 처음 왔어요/ }).click();
  await expect(
    page.getByText("작고 포근한 마을이네요. 앞으로 잘 부탁해요!"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  // The board is solid: moving north into it must not reach the house.
  await walk("w", 1100);
  await expect(page.getByRole("status")).toContainText("게시판 보기");
  await walk("a", 800);
  await walk("w", 1000);
  await walk("d", 800);
  await expect(page.getByRole("status")).toContainText("내 프로필 보기");
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("Orange Cat");
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await walk("a", 600);
  await walk("s", 2600);
  await walk("d", 2900);
  await expect(page.getByRole("status")).toContainText("상점 둘러보기");
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("발바닥 쿠션");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.screenshot({ path: "test-results/town.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("fullscreen and cat selection remain usable and persist", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("마을의 문을 여는 중…")).toBeHidden();
  await page.getByRole("button", { name: "전체화면", exact: false }).click();
  await expect(page.locator(".app")).toHaveClass(/is-fullscreen/);
  await expect
    .poll(async () => page.locator("canvas").evaluate((canvas) => canvas.width))
    .toBe(1440);
  await page.getByRole("button", { name: "고양이 선택", exact: true }).click();
  for (const name of [
    "삼색고양이",
    "턱시도고양이",
    "고등어고양이",
    "검은고양이",
    "흰고양이",
    "치즈고양이",
  ]) {
    const option = page.getByRole("button", { name: new RegExp(name) });
    await option.click();
    await expect(option).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: /삼색고양이/ }).click();
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page.keyboard.down("d");
  await page.waitForTimeout(200);
  await page.keyboard.up("d");
  await page.screenshot({ path: "test-results/fullscreen-calico.png" });
  await page.getByRole("button", { name: /전체화면 나가기/ }).click();
  await expect(page.locator(".app")).not.toHaveClass(/is-fullscreen/);
  await page.reload();
  await expect(page.getByText("마을의 문을 여는 중…")).toBeHidden();
  await expect
    .poll(async () => page.locator("canvas").evaluate((canvas) => canvas.width))
    .toBe(1204);
  await page.getByRole("button", { name: "고양이 선택", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /삼색고양이/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("dialog")).toContainText("Calico Cat");
  expect(errors).toEqual([]);
});
