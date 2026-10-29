import test from "node:test";
import assert from "node:assert/strict";
import { ref } from "vue";
import {
  protectWork,
  blockingWork,
  applyWhenIdle,
} from "../src/shared/lib/workProtection.js";
test("updates wait for every live draft or transfer, then apply after release", async () => {
  const dirty = ref(true),
    uploading = ref(true);
  let applied = 0;
  const releaseDraft = protectWork("메모 작성", () => dirty.value),
    releaseUpload = protectWork("파일 업로드", () => uploading.value);
  try {
    assert.deepEqual(blockingWork.value, ["메모 작성", "파일 업로드"]);
    assert.equal(await applyWhenIdle(() => applied++), false);
    dirty.value = false;
    assert.deepEqual(blockingWork.value, ["파일 업로드"]);
    assert.equal(await applyWhenIdle(() => applied++), false);
    releaseUpload();
    assert.deepEqual(blockingWork.value, []);
    assert.equal(await applyWhenIdle(() => applied++), true);
    assert.equal(applied, 1);
  } finally {
    releaseDraft();
    releaseUpload();
  }
  assert.deepEqual(blockingWork.value, []);
});
test("absent update handler is harmless and apply failures remain visible to callers", async () => {
  assert.equal(await applyWhenIdle(), false);
  await assert.rejects(
    applyWhenIdle(async () => {
      throw Error("update failed");
    }),
    /update failed/,
  );
});
