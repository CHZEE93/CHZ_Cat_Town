import { test, expect, type Page } from "@playwright/test";
const password = "test-safe-password-123";
async function signup(page: Page) {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  await page.goto("/");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "로그인 / 회원가입" })
    .click();
  await page.getByRole("button", { name: "회원가입", exact: true }).click();
  await page.getByLabel("이메일", { exact: true }).fill(email);
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByLabel("닉네임", { exact: true }).fill("테스트 주민");
  await page.getByRole("button", { name: "가입하고 시작하기" }).click();
  await expect(page.getByRole("dialog")).toContainText("My little home");
  return email;
}
async function close(page: Page) {
  await page.getByRole("button", { name: "닫기", exact: true }).click();
}

test("account, profile, board CRUD, purchases, wardrobe and login persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const email = await signup(page);
  const postTitle = `산책 일기 ${Date.now()}`;
  const editedTitle = `수정된 ${postTitle}`;
  await expect(page.getByRole("dialog")).toContainText("내 코인 · 1,000");
  await page.getByLabel("닉네임", { exact: true }).fill("산책하는 치즈");
  await page.getByLabel("자기소개").fill("따뜻한 오후의 산책을 좋아해요.");
  await page.getByRole("button", { name: "프로필 저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("프로필을 저장했어요");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /상점 둘러보기/ })
    .click();
  await expect(page.getByTestId("wallet-balance")).toHaveText("1,000");
  for (const name of ["산책 밀짚모자", "딸기 리본", "작은 산책 가방"]) {
    await page
      .getByRole("button", { name: `${name} 구매`, exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: `${name} 보유 중`, exact: true }),
    ).toBeDisabled();
  }
  await expect(page.getByTestId("wallet-balance")).toHaveText("50");
  await page.getByRole("button", { name: /내 옷장/ }).click();
  await page.getByRole("button", { name: /삼색고양이/ }).click();
  await page.getByLabel("머리", { exact: true }).selectOption("straw_hat");
  await page.getByLabel("목", { exact: true }).selectOption("red_ribbon");
  await page.getByLabel("등", { exact: true }).selectOption("tiny_backpack");
  await page.getByRole("button", { name: "외형 저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "고양이 외형을 저장했어요",
  );
  await page.locator(".modal").evaluate((element) => element.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/wardrobe.png" });
  await page.getByRole("button", { name: /턱시도고양이/ }).click();
  await page.getByLabel("머리", { exact: true }).selectOption("");
  await page.getByRole("button", { name: "변경 취소", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /삼색고양이/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("머리", { exact: true })).toHaveValue(
    "straw_hat",
  );
  await page.getByRole("button", { name: /턱시도고양이/ }).click();
  await close(page);
  await page.getByRole("button", { name: /내 고양이 보기/ }).click();
  await expect(
    page.getByRole("button", { name: /삼색고양이/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /산책하는 치즈/, level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "게시판 전체 보기" }).click();
  await page.getByRole("button", { name: "글쓰기", exact: true }).click();
  await page.getByLabel("제목", { exact: true }).fill(postTitle);
  await page
    .getByLabel("내용", { exact: true })
    .fill("반가워요!\n<script>alert('plain text')</script>");
  await page.getByRole("button", { name: "게시글 저장" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: new RegExp(postTitle) })
    .click();
  await expect(page.locator(".post-body")).toContainText("<script>");
  await page.getByRole("button", { name: "수정", exact: true }).click();
  await page.getByLabel("제목", { exact: true }).fill(editedTitle);
  await page.getByRole("button", { name: "게시글 저장" }).click();
  await close(page);
  await page.reload();
  await expect(page.locator(".home-posts")).toContainText(editedTitle);
  await page.getByRole("button", { name: "게시판 전체 보기" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: new RegExp(editedTitle) })
    .click();
  await page.getByRole("button", { name: "삭제", exact: true }).click();
  await page.getByRole("button", { name: "삭제 확인", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: new RegExp(editedTitle) }),
  ).toHaveCount(0);
  await close(page);
  await page.getByRole("button", { name: /내 고양이 보기/ }).click();
  await page.getByRole("button", { name: "로그아웃", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /여행자/, level: 1 }),
  ).toBeVisible();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "로그인 / 회원가입" })
    .click();
  await page.getByLabel("이메일", { exact: true }).fill(email);
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByRole("button", { name: "로그인하기", exact: true }).click();
  await expect(page.getByLabel("자기소개")).toHaveValue(
    "따뜻한 오후의 산책을 좋아해요.",
  );
  await expect(page.getByLabel("머리", { exact: true })).toHaveValue(
    "straw_hat",
  );
  await expect(page.getByRole("dialog")).toContainText("내 코인 · 50");
  // A second browser tab saved a newer version: the stale form must not overwrite it.
  const session = await (await page.request.get("/api/auth/session")).json();
  await page.request.patch("/api/characters/me", {
    headers: {
      Origin: "http://localhost:5181",
      "X-CSRF-Token": session.csrfToken,
    },
    data: { ...session.character, catType: "black" },
  });
  await page.getByRole("button", { name: "외형 저장", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "다른 화면에서 외형이 변경",
  );
  await page.getByRole("button", { name: "저장된 외형 다시 불러오기" }).click();
  await expect(
    page.getByRole("button", { name: /검은고양이/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await close(page);
  await page.goto("/?debug=1#/game");
  await page.waitForFunction(
    () => !!window.__CHZ_TOWN__,
    {},
    { timeout: 60000 },
  );
  await expect
    .poll(() => page.evaluate(() => window.__CHZ_TOWN__!().equipped))
    .toEqual({ head: "straw_hat", neck: "red_ribbon", back: "tiny_backpack" });
  await expect
    .poll(() => page.evaluate(() => window.__CHZ_TOWN__!().catType))
    .toBe("black");
  await page.screenshot({ path: "test-results/equipped-town.png" });
  expect(errors).toEqual([]);
});

test("guest permissions, failed requests and mobile account form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "게시판 전체 보기" }).click();
  await expect(
    page.getByRole("button", { name: "글쓰기", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("dialog")).toContainText("로그인하면");
  await close(page);
  await page.getByRole("button", { name: /상점 둘러보기/ }).click();
  await expect(
    page.getByRole("button", { name: "산책 밀짚모자 구매", exact: true }),
  ).toHaveText("로그인 후 구매");
  await page
    .getByRole("button", { name: "산책 밀짚모자 구매", exact: true })
    .click();
  await page.getByLabel("이메일", { exact: true }).fill("missing@example.com");
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByRole("button", { name: "로그인하기", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("이메일 또는 비밀번호");
  await page.screenshot({ path: "test-results/mobile-auth.png" });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await close(page);
  await page.route("**/api/posts*", (route) =>
    route.fulfill({ status: 503, json: { detail: "연결 테스트" } }),
  );
  await page.reload();
  await page.getByRole("button", { name: "게시판 전체 보기" }).click();
  await expect(page.getByRole("alert")).toContainText("연결 테스트");
  await page.unroute("**/api/posts*");
  await page.getByRole("button", { name: "다시 불러오기" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("expired session clears account and equipment", async ({ page }) => {
  await signup(page);
  await close(page);
  await page.context().clearCookies();
  await page.getByRole("button", { name: /상점 둘러보기/ }).click();
  await page
    .getByRole("button", { name: "산책 밀짚모자 구매", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("로그인이 만료되었어요");
  await expect(
    page.getByRole("button", { name: "산책 밀짚모자 구매", exact: true }),
  ).toHaveText("로그인 후 구매");
  await close(page);
  await expect(
    page.getByRole("heading", { name: /여행자/, level: 1 }),
  ).toBeVisible();
});

test("size preview cancel save and account persistence", async ({ page }) => {
  const email = await signup(page);
  const slider = page.getByRole("slider", { name: "고양이 크기", exact: true });
  await expect(slider).toHaveValue("1");
  await slider.focus();
  await slider.press("End");
  await page.getByRole("button", { name: "변경 취소", exact: true }).click();
  await expect(slider).toHaveValue("1");
  await slider.focus();
  await slider.press("End");
  await close(page);
  await page.getByRole("button", { name: /내 고양이 보기/ }).click();
  await expect(slider).toHaveValue("1");
  await slider.focus();
  await slider.press("End");
  await page.getByRole("button", { name: "외형 저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "고양이 외형을 저장했어요",
  );
  await page.locator(".modal").evaluate((element) => element.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/size-wardrobe.png" });
  await page.getByRole("button", { name: "로그아웃", exact: true }).click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "로그인 / 회원가입" })
    .click();
  await page.getByLabel("이메일", { exact: true }).fill(email);
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByRole("button", { name: "로그인하기", exact: true }).click();
  await expect(slider).toHaveValue("1.5");
  await close(page);
  await page.goto("/?debug=1#/game");
  await page.waitForFunction(
    () => !!window.__CHZ_TOWN__,
    {},
    { timeout: 60000 },
  );
  await expect
    .poll(() => page.evaluate(() => window.__CHZ_TOWN__!().scale))
    .toBe(1.5);
  await expect
    .poll(() => page.evaluate(() => window.__CHZ_TOWN__!().colliderRadius))
    .toBeCloseTo(0.51, 4);
});
