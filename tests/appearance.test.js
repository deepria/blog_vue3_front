import test from "node:test";
import assert from "node:assert/strict";
import {
  designOptions,
  getAppearance,
  normalizeDesign,
  normalizeMode,
  readPreference,
  writePreference,
  DESIGN_STORAGE_KEY,
  MODE_STORAGE_KEY,
} from "../src/features/appearance/lib/themes.js";

test("all six appearance combinations drive CSS and Ant Design from the same palette", () => {
  const combinations = new Set();
  for (const { id } of designOptions)
    for (const mode of ["light", "dark"]) {
      const { vars, ant } = getAppearance(id, mode);
      assert.equal(vars["color-primary"], ant.colorPrimary);
      assert.equal(vars["color-bg-surface"], ant.colorBgContainer);
      assert.equal(vars["text-inverse"], ant.colorTextLightSolid);
      assert.equal(vars["color-text-primary"], ant.colorText);
      assert.equal(vars["radius-md"], `${ant.borderRadius}px`);
      combinations.add(`${vars["color-bg-base"]}/${vars["color-primary"]}`);
    }
  assert.equal(combinations.size, 6);
});

test("invalid stored choices fall back without accepting arbitrary style values", () => {
  assert.equal(normalizeDesign("unknown"), "editorial");
  assert.equal(normalizeMode("system"), "light");
  assert.deepEqual(
    getAppearance(null, null),
    getAppearance("editorial", "light"),
  );
});

test("design and brightness persist independently in browser preferences", (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const values = new Map([[MODE_STORAGE_KEY, "dark"]]);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  });
  t.after(() => {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  });
  writePreference(DESIGN_STORAGE_KEY, "console");
  assert.equal(readPreference(DESIGN_STORAGE_KEY, "editorial"), "console");
  assert.equal(readPreference(MODE_STORAGE_KEY, "light"), "dark");
});

test("restricted storage does not prevent rendering or changing the in-memory theme", (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("storage unavailable");
    },
  });
  t.after(() => {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  });
  assert.equal(readPreference(DESIGN_STORAGE_KEY, "editorial"), "editorial");
  assert.doesNotThrow(() => writePreference(DESIGN_STORAGE_KEY, "studio"));
});

function luminance(hex) {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)
    .map((value) => parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function contrast(left, right) {
  const a = luminance(left),
    b = luminance(right);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
test("body, supporting text and enabled primary buttons retain readable contrast in all themes", () => {
  for (const { id } of designOptions)
    for (const mode of ["light", "dark"]) {
      const { vars: v } = getAppearance(id, mode);
      for (const background of [
        "color-bg-base",
        "color-bg-surface",
        "color-bg-panel",
        "color-bg-elevated",
      ]) {
        for (const foreground of [
          "color-text-primary",
          "color-text-secondary",
          "color-text-muted",
        ])
          assert.ok(
            contrast(v[foreground], v[background]) >= 4.5,
            `${id}/${mode}: ${foreground} on ${background}`,
          );
      }
      assert.ok(
        contrast(v["color-primary"], v["text-inverse"]) >= 4.5,
        `${id}/${mode}: primary button`,
      );
      assert.ok(
        contrast(v["nav-ink"], v["nav-bg"]) >= 4.5,
        `${id}/${mode}: navigation`,
      );
      assert.ok(
        contrast(v["nav-accent"], v["nav-selected"]) >= 4.5,
        `${id}/${mode}: active navigation`,
      );
    }
});
