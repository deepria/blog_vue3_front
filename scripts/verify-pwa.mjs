// Run against a local production preview. The temporary worker change is restored.
const { default: puppeteer } = await import(
  process.env.PUPPETEER_MODULE || "puppeteer-core"
);
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
const base = process.env.REVIEW_BASE || "http://127.0.0.1:4176";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw Error("This check requires a local preview.");
const dir = path.resolve("docs/workspace-completion-2026-10-29");
await mkdir(dir, { recursive: true });
const workerPath = path.resolve("dist/sw.js");
const originalWorker = await readFile(workerPath, "utf8");
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto(base + "/login", { waitUntil: "networkidle0" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: "networkidle0" });
  assert.ok(await page.$(".login-panel"));
  assert.match(
    await page.$eval(".pwa-status", (el) => el.textContent),
    /오프라인/,
  );
  await page.screenshot({
    path: dir + "/pwa-offline-login.png",
    fullPage: true,
  });
  await page.setOfflineMode(false);
  await writeFile(
    workerPath,
    originalWorker + "\n// local-update-check-" + Date.now() + "\n",
  );
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.update();
  });
  await page.waitForSelector(".pwa-notice.update");
  await (await page.$$(".pwa-notice.update button"))[1].click();
  await page.waitForFunction(
    () => !document.querySelector(".pwa-notice.update"),
  );
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector(".pwa-notice.update");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    (await page.$$(".pwa-notice.update button"))[0].click(),
  ]);
  assert.ok(await page.$(".login-panel"));
  assert.equal(
    await page.evaluate(async () =>
      Boolean((await navigator.serviceWorker.getRegistration()).waiting),
    ),
    false,
  );
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: "networkidle0" });
  assert.ok(await page.$(".login-panel"));
  assert.deepEqual(errors, []);
  const result = {
    localPreview: base,
    serviceWorkerBypassed: false,
    offlineShell: true,
    deferredUpdate: true,
    manualUpdateReload: true,
    offlineAfterUpdate: true,
    errors,
  };
  await writeFile(dir + "/pwa-checks.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally {
  await writeFile(workerPath, originalWorker);
  await browser.close();
}
