import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
await page.goto("http://localhost:5173");
await page.waitForTimeout(2000);
await page.screenshot({ path: "test-results/initial.png", fullPage: true });
await browser.close();
