import test from "node:test";
import assert from "node:assert/strict";
import { createDraftSaver } from "../src/features/memo/lib/draftSaver.js";
function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
test("slow saves preserve live edits and drain the newest draft without concurrent requests", async () => {
  let draft = { title: "첫 제목", content: "첫 내용" },
    id = "",
    active = 0,
    peak = 0;
  const requests = [],
    acks = [];
  const first = deferred();
  const saver = createDraftSaver({
    read: () => draft,
    persist: async (snapshot) => {
      active++;
      peak = Math.max(peak, active);
      requests.push({ id, ...snapshot });
      if (requests.length === 1) await first.promise;
      id = "created-id";
      active--;
      return { id };
    },
    acknowledge: (snapshot) => acks.push(snapshot),
  });
  const pending = saver.save();
  draft = {
    title: "입력 중 바꾼 제목",
    content: "응답을 기다리는 동안 입력한 최신 내용",
  };
  assert.equal(saver.save(), pending);
  first.resolve();
  await pending;
  assert.equal(peak, 1);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].id, "");
  assert.equal(requests[1].id, "created-id");
  assert.equal(draft.content, "응답을 기다리는 동안 입력한 최신 내용");
  assert.deepEqual(acks.at(-1), draft);
});
test("a failed save leaves the live draft untouched and a retry sends the latest contents", async () => {
  let draft = { title: "제목", content: "처음" },
    fail = true;
  const snapshots = [];
  const saver = createDraftSaver({
    read: () => draft,
    persist: async () => {
      if (fail) throw Error("offline");
      return { id: "1" };
    },
    acknowledge: (s) => snapshots.push(s),
  });
  await assert.rejects(saver.save(), /offline/);
  assert.equal(snapshots.length, 0);
  draft = { title: "바뀐 제목", content: "재시도할 최신 내용" };
  fail = false;
  await saver.save();
  assert.deepEqual(snapshots, [draft]);
});
