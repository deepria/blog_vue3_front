const { default: puppeteer } = await import(
  process.env.PUPPETEER_MODULE || "puppeteer-core"
);
import assert from "node:assert/strict";
import { writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const base = process.env.REVIEW_BASE || "http://127.0.0.1:5175";
const dir = path.resolve(
  process.env.REVIEW_OUTPUT || "docs/workspace-completion-2026-10-29",
);
const widths = (process.env.REVIEW_WIDTHS || "360,768,1440")
  .split(",")
  .map(Number);
assert.ok(
  widths.length &&
    widths.every(
      (width) => Number.isInteger(width) && width >= 320 && width <= 3840,
    ),
  "REVIEW_WIDTHS must contain viewport widths from 320 to 3840",
);
await mkdir(dir, { recursive: true });
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage();
page.on("dialog", (dialog) => dialog.accept());
await page.setBypassServiceWorker(true);
const errors = [];
const results = [];
let clipboard =
  "아이디어를 모으고, 생각을 연결하고, 나만의 속도로 완성하기.\n\n이번 주에는 작업 공간을 조금 더 나답게 정리해보자.";
let requests = [];
page.on("pageerror", (e) => errors.push(e.message));
let failSave = false,
  failTodos = false,
  failFiles = false,
  saveDelay = 0,
  uploadDelay = 0,
  saves = 0,
  created = 0;
let organization = {
  directories: [
    { id: "dashboard", name: "Dashboard", parent_id: null, sort_order: 0 },
  ],
  file_locations: {},
};
const notes = [
  {
    id: "sample-1",
    title: "좋은 작업 공간에 대한 생각",
    content:
      "# 좋은 작업 공간에 대한 생각\n\n생각을 꺼내 놓을 수 있는 공간.\n\n## 이번 주의 작은 목표\n\n- [ ] 기록을 위한 시간을 만들기\n- [x] 흩어진 아이디어 모으기",
    updated_at: "2026-10-29T01:20:00Z",
  },
  {
    id: "sample-2",
    title: "이번 주에 해보고 싶은 것들",
    content: "작고 확실한 시작.",
    updated_at: "2026-10-28T04:35:00Z",
  },
  {
    id: "sample-3",
    title: "다음 프로젝트를 위한 단서",
    content: "다시 꺼내 보고 싶은 생각들.",
    updated_at: "2026-10-27T02:00:00Z",
  },
];
await page.setRequestInterception(true);
page.on("request", async (r) => {
  const url = new URL(r.url());
  if (url.pathname.startsWith("/api/")) {
    requests.push({ path: url.pathname, method: r.method() });
    let data = {};
    let status = 200;
    if (r.method() === "OPTIONS") data = {};
    else if (url.pathname === "/api/auth/me")
      data = {
        user: {
          id: "design-review",
          name: "deepria",
          email: "deepria@example.test",
        },
        providers: ["google"],
      };
    else if (url.pathname === "/api/settings")
      data = { dashboard_gallery_enabled: false };
    else if (url.pathname === "/api/clipboard") {
      if (r.method() === "PUT") clipboard = JSON.parse(r.postData()).text;
      data = { text: clipboard };
    } else if (url.pathname === "/api/memos") {
      if (r.method() === "POST") {
        saves++;
        await new Promise((resolve) => setTimeout(resolve, saveDelay));
        if (failSave) {
          status = 500;
          data = {};
        } else {
          const draft = JSON.parse(r.postData());
          data = {
            ...draft,
            id: "new-" + ++created,
            updated_at: new Date().toISOString(),
          };
          notes.push(data);
        }
      } else data = { items: notes };
    } else if (url.pathname.startsWith("/api/memos/")) {
      const note = notes.find((n) => url.pathname.endsWith(n.id)) || notes[0];
      if (r.method() === "PUT") {
        saves++;
        await new Promise((resolve) => setTimeout(resolve, saveDelay));
        if (failSave) status = 500;
        else Object.assign(note, JSON.parse(r.postData()));
      }
      data = note;
    } else if (url.pathname === "/api/friends")
      data = { friends: [], incoming_requests: [], outgoing_requests: [] };
    else if (url.pathname === "/api/files") {
      if (failFiles) status = 500;
      data = {
        items: [
          {
            key: "sample.md",
            display_name: "프로젝트 아이디어.md",
            size: 2048,
            created_at: 1793236800,
            has_password: false,
          },
        ],
      };
    } else if (url.pathname === "/api/files/shared-with-me")
      data = { items: [] };
    else if (url.pathname === "/api/files/organization") {
      if (r.method() === "PUT") organization = JSON.parse(r.postData());
      data = organization;
    } else if (url.pathname === "/api/files/presign-upload")
      data = { key: "uploaded.txt", upload_url: base + "/fixture-upload" };
    else if (url.pathname === "/api/todo-meta")
      data = {
        groups: [{ key: 1, name: "개인 작업", color: "#3759d7" }],
        priorities: [{ key: 1, name: "중요", color: "#95601d" }],
      };
    else if (url.pathname === "/api/todos") {
      if (failTodos) status = 500;
      data = {
        items: [
          {
            id: 1,
            text: "오늘 떠오른 아이디어 정리하기",
            completed: false,
            groupKey: 1,
            priorityKey: 1,
          },
        ],
      };
    }
    return r.respond({
      status,
      contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": base,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      },
      body: JSON.stringify(
        status === 200
          ? { data }
          : { error: { code: "internal", message: "fixture failure" } },
      ),
    });
  }
  if (url.pathname === "/fixture-upload") {
    await new Promise((resolve) => setTimeout(resolve, uploadDelay));
    return r.respond({ status: 200, body: "" });
  }
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) &&
    !["data:", "blob:"].includes(url.protocol)
  )
    return r.abort();
  r.continue();
});
async function visit(path) {
  await page.goto(base + path, { waitUntil: "networkidle0" });
  assert.notEqual(new URL(page.url()).pathname, "/login");
  await page.addStyleTag({
    content:
      "#vue-inspector-container, #__vue-devtools-container__ { display:none !important; }",
  });
}

const checks = [];
async function until(check) {
  for (let i = 0; i < 100; i++) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw Error("Timed out waiting for fixture");
}
async function input(selector, value) {
  await page.$eval(
    selector,
    (el, text) => {
      el.value = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    },
    value,
  );
}
await page.setViewport({ width: 1440, height: 1000 });
await visit("/memo/edit/sample-1");
saveDelay = 450;
const oldCount = saves;
await input(".markdown-editor", "먼저 전송할 문장");
await until(() => saves > oldCount);
await input(".markdown-editor", "저장 응답 중 추가한 최신 문장");
await until(() => notes[0].content === "저장 응답 중 추가한 최신 문장");
await page.waitForFunction(() =>
  document.querySelector(".save-indicator").textContent.includes("저장됨"),
);
assert.equal(
  await page.$eval(".markdown-editor", (el) => el.value),
  "저장 응답 중 추가한 최신 문장",
);
checks.push("slow-save-latest-input");
saveDelay = 0;
failSave = true;
await input(".markdown-editor", "실패해도 유지할 내용");
await page.click(".primary-icon-button");
await page.waitForFunction(() =>
  document.querySelector(".save-indicator").textContent.includes("저장 실패"),
);
assert.equal(
  await page.$eval(".markdown-editor", (el) => el.value),
  "실패해도 유지할 내용",
);
failSave = false;
await page.click(".primary-icon-button");
await until(() => notes[0].content === "실패해도 유지할 내용");
checks.push("failed-save-retry");
await visit("/memo/edit");
await input(".markdown-editor", "새 메모의 초기 입력");
await page.click(".primary-icon-button");
await page.waitForFunction(() =>
  location.pathname.startsWith("/memo/edit/new-"),
);
assert.equal(
  await page.$eval(".markdown-editor", (el) => el.value),
  "새 메모의 초기 입력",
);
checks.push("new-memo-id-transition");
await page.setViewport({ width: 390, height: 844 });
await page.click(".editor-mode-tabs button:nth-child(2)");
assert.equal(
  await page.$eval(".editor-surface", (el) => getComputedStyle(el).display),
  "none",
);
assert.match(
  await page.$eval(".reader-preview-body", (el) => el.textContent),
  /새 메모의 초기 입력/,
);
await page.click(".editor-mode-tabs button:first-child");
assert.equal(
  await page.$eval(".markdown-editor", (el) => el.value),
  "새 메모의 초기 입력",
);
checks.push("mobile-editor-mode");
await visit("/todo");
await input(".quick-add-container input", "실패 전에 추가한 작업");
await page.click(".quick-add-btn");
failTodos = true;
await page.click(".mobile-task-actions button:first-child");
await page.waitForSelector(".task-error");
assert.match(
  await page.$eval(".task-list-container", (el) => el.textContent),
  /실패 전에 추가한 작업/,
);
failTodos = false;
await page.click(".task-error button");
await page.waitForFunction(() => !document.querySelector(".task-error"));
checks.push("todo-failure-preserves-draft");
await page.click(".mobile-task-actions .settings-button");
await page.waitForSelector("[role=dialog]");
assert.ok(
  await page.$eval(".modal-container", (el) =>
    el.contains(document.activeElement),
  ),
);
const last = await page.$(".modal-footer button:last-child");
await last.focus();
await page.keyboard.press("Tab");
assert.ok(
  await page.$eval(".modal-container", (el) =>
    el.contains(document.activeElement),
  ),
);
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector(".modal-container"));
assert.ok(
  await page.$eval(
    ".mobile-task-actions .settings-button",
    (el) => el === document.activeElement,
  ),
);
checks.push("dialog-focus-tab-escape-return");
await visit("/s3");
failFiles = true;
await page.click(".page-shell-actions button");
await page.waitForSelector(".storage-error");
assert.match(
  await page.$eval(".file-grid", (el) => el.textContent),
  /프로젝트 아이디어/,
);
failFiles = false;
await page.click(".storage-error button");
await page.waitForFunction(() => !document.querySelector(".storage-error"));
checks.push("file-retry-preserves-list");
await page.waitForSelector('[title="폴더 이동"]');
await page.waitForFunction(
  () =>
    !document.querySelector(".file-list-leave-active,.file-list-enter-active"),
);
await page.$eval('[title="폴더 이동"]', (el) =>
  el.scrollIntoView({ block: "center" }),
);
await page.click('[title="폴더 이동"]');
await page.waitForSelector("#move-directory");
await page.select("#move-directory", "dashboard");
await page.click(".modal-footer button:last-child");
await until(() => organization.file_locations["sample.md"] === "dashboard");
checks.push("mobile-file-move");
await visit("/s3");
const scratch = await mkdtemp(path.join(tmpdir(), "deepria-upload-"));
const uploadPath = path.join(scratch, "검증.txt");
await writeFile(uploadPath, "업로드 보호 검증");
await (await page.$(".upload-zone input[type=file]")).uploadFile(uploadPath);
await page.waitForSelector(".modal-container");
uploadDelay = 2000;
await page.click(".modal-footer button:last-child");
await until(() => requests.some((r) => r.path === "/api/files/presign-upload"));
assert.equal(
  await page.$eval(".modal-header .close-btn", (el) => el.disabled),
  true,
);
await page.keyboard.press("Escape");
assert.ok(await page.$(".modal-container"));
await page.evaluate(async () => {
  const pwa = await import("/src/shared/pwa.js");
  pwa.pwaUpdateAvailable.value = true;
});
await page.waitForSelector(".pwa-notice.update button:disabled");
assert.equal(
  await page.evaluate(() => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  }),
  true,
);
await page.waitForFunction(() => !document.querySelector(".modal-container"));
await rm(scratch, { recursive: true, force: true });
checks.push("upload-close-and-update-protection");
await visit("/memo");
await input(".search-input input", "이번 주");
await page.waitForFunction(() =>
  document
    .querySelector(".preview-title-row h2")
    ?.textContent.includes("이번 주"),
);
await page.click(".preview-title-row button");
await page.waitForSelector(".markdown-editor");
await page.click('[title="목록으로"]');
await page.waitForSelector(".search-input input");
assert.equal(
  await page.$eval(".search-input input", (el) => el.value),
  "이번 주",
);
checks.push("memo-list-state-restored");
failFiles = true;
await visit("/s3");
await page.waitForSelector(".storage-error");
assert.equal(await page.$(".library-panel .empty-state"), null);
failFiles = false;
await page.click(".storage-error button");
await page.waitForFunction(() => !document.querySelector(".storage-error"));
checks.push("initial-file-error-is-not-empty");
await visit("/chat");
await input(".composer-area textarea", "한글 조합");
const beforeChat = requests.filter(
  (r) => r.method === "POST" && /llm|chat/.test(r.path),
).length;
await page.$eval(".composer-area textarea", (el) =>
  el.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      isComposing: true,
      bubbles: true,
      cancelable: true,
    }),
  ),
);
assert.equal(
  await page.$eval(".composer-area textarea", (el) => el.value),
  "한글 조합",
);
assert.equal(
  requests.filter((r) => r.method === "POST" && /llm|chat/.test(r.path)).length,
  beforeChat,
);
checks.push("korean-composition-enter-does-not-send");
await input(".composer-area textarea", "");
await page.emulateMediaFeatures([
  { name: "prefers-reduced-motion", value: "reduce" },
]);
assert.ok(
  await page.$eval(
    ".navigation-mobile a",
    (el) => parseFloat(getComputedStyle(el).transitionDuration) <= 0.001,
  ),
);
checks.push("reduced-motion");
await page.emulateMediaFeatures([]);

await visit("/account");
if (process.env.REVIEW_SCOPE !== "interactions") {
  for (const design of ["editorial", "studio", "console"])
    for (const mode of ["light", "dark"]) {
      await page.click(`input[name=workspace-design][value=${design}]`);
      await page.click(`input[name=workspace-mode][value=${mode}]`);
      for (const width of widths) {
        await page.setViewport({ width, height: 1000 });
        for (const [name, path] of [
          ["home", "/"],
          ["memo", "/memo"],
          ["editor", "/memo/edit/sample-1"],
          ["tasks", "/todo"],
          ["files", "/s3"],
          ["chat", "/chat"],
          ["settings", "/account"],
        ]) {
          await visit(path);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          );
          results.push({ design, mode, width, screen: name, overflow });
          if (
            (width === 360 &&
              (name === "home" || name === "files" || name === "editor")) ||
            (width === 1440 &&
              ["home", "memo", "tasks", "chat", "settings"].includes(name))
          )
            await page.screenshot({
              path: `${dir}/${design}-${mode}-${name}-${width === 360 ? "mobile" : "desktop"}.png`,
              fullPage: true,
            });
        }
      }
    }
}
await writeFile(
  `${dir}/${process.env.REVIEW_SCOPE === "interactions" ? "interaction-checks" : "browser-checks"}.json`,
  JSON.stringify(
    { errors, checks, results, fixtureOnly: true, serviceWorkerBypassed: true },
    null,
    2,
  ),
);
assert.equal(errors.length, 0, JSON.stringify(errors));
assert.equal(
  results.filter((r) => r.overflow).length,
  0,
  JSON.stringify(results.filter((r) => r.overflow)),
);
await browser.close();
console.log(
  JSON.stringify({
    checks,
    combinations: results.length,
    errors,
    overflow: results.filter((r) => r.overflow),
  }),
);
