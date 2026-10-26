import test from "node:test";
import assert from "node:assert/strict";
import {
  getPreviewType,
  sortFiles,
} from "../src/features/storage/lib/filePresentation.js";
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

test("sorts file registration dates numerically with missing dates always last", () => {
  const files = [
    { display_name: "legacy.txt", created_at: null },
    { display_name: "new.txt", created_at: 100 },
    { display_name: "old2.txt", created_at: 9 },
    { display_name: "missing.txt" },
    { display_name: "old1.txt", created_at: 9 },
  ];
  assert.deepEqual(
    sortFiles(files, "created_at", "asc").map((file) => file.display_name),
    ["old1.txt", "old2.txt", "new.txt", "legacy.txt", "missing.txt"],
  );
  assert.deepEqual(
    sortFiles(files, "created_at", "desc").map((file) => file.display_name),
    ["new.txt", "old2.txt", "old1.txt", "missing.txt", "legacy.txt"],
  );
  assert.equal(files[0].display_name, "legacy.txt");
});

test("keeps natural name and extension ordering", () => {
  const files = [
    { display_name: "file10.txt" },
    { display_name: "file2.TXT" },
    { display_name: "photo.png" },
  ];
  assert.deepEqual(
    sortFiles(files).map((file) => file.display_name),
    ["file2.TXT", "file10.txt", "photo.png"],
  );
  assert.deepEqual(
    sortFiles(files, "extension").map((file) => file.display_name),
    ["photo.png", "file2.TXT", "file10.txt"],
  );
});
