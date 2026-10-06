import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
await page.goto("http://localhost:5173");
await page
  .getByText("마을의 문을 여는 중…")
  .waitFor({ state: "hidden", timeout: 60000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: "test-results/initial.png", fullPage: true });
await browser.close();
