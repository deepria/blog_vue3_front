import test from "node:test";
import assert from "node:assert/strict";
import { parseMemoDate, toggleMarkdownTask } from "../src/features/memo/lib/memoContent.js";
import { normalizeMemo } from "../src/features/memo/lib/memoModel.js";

test("toggles only the requested markdown task", () => {
  const content = "- [ ] first\n- [x] second\nplain";
  assert.equal(toggleMarkdownTask(content, 1), "- [ ] first\n- [ ] second\nplain");
  assert.equal(toggleMarkdownTask(content, 3), null);
});

test("parses epoch seconds and ISO memo timestamps", () => {
  assert.equal(parseMemoDate("1710000000")?.getTime(), 1710000000000);
  assert.equal(parseMemoDate("not-a-date"), null);
});

test("normalizes API timestamp casing once at the feature boundary", () => {
  assert.equal(normalizeMemo({ updated_at: "2026-01-01" }).updatedAt, "2026-01-01");
});
