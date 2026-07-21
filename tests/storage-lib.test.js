import test from "node:test";
import assert from "node:assert/strict";
import { getPreviewType } from "../src/features/storage/lib/filePresentation.js";
import {
  collectDirectoryIds,
  normalizeOrganization,
} from "../src/features/storage/lib/organization.js";

test("classifies supported storage previews consistently", () => {
  assert.equal(getPreviewType("photo.WEBP"), "image");
  assert.equal(getPreviewType("notes.md"), "markdown");
  assert.equal(getPreviewType("events.json"), "text");
  assert.equal(getPreviewType("archive.zip"), "unsupported");
});

test("normalizes and traverses nested directory organizations", () => {
  assert.deepEqual(normalizeOrganization({}), {
    directories: [],
    file_locations: {},
  });
  const ids = collectDirectoryIds(
    [
      { id: "root", parent_id: null },
      { id: "child", parent_id: "root" },
      { id: "nested", parent_id: "child" },
      { id: "other", parent_id: null },
    ],
    "root",
  );
  assert.deepEqual([...ids].sort(), ["child", "nested", "root"]);
});
