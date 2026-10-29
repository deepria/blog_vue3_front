import test from "node:test";
import assert from "node:assert/strict";
import { userMessage } from "../src/shared/lib/userMessage.js";
import {
  clearListState,
  readListState,
  writeListState,
} from "../src/shared/lib/listState.js";
test("technical English is replaced by contextual Korean without translating user content", () => {
  assert.equal(
    userMessage({ status: 403, message: "Access denied" }),
    "이 작업을 수행할 권한이 없습니다.",
  );
  assert.match(userMessage({ status: 429 }), /잠시 후/);
  assert.match(userMessage({ code: "ECONNABORTED" }), /시간이 초과/);
  assert.equal(
    userMessage({ userMessage: "입력한 보호 키가 다릅니다." }),
    "입력한 보호 키가 다릅니다.",
  );
  assert.equal(
    userMessage(
      { message: "Internal server details" },
      "목록을 불러오지 못했습니다.",
    ),
    "목록을 불러오지 못했습니다.",
  );
});
test("navigation memory is separated by user and cleared at session boundaries", () => {
  clearListState();
  writeListState("alice", "memos", { query: "생각", selected: "1" });
  assert.equal(readListState("alice", "memos").query, "생각");
  assert.deepEqual(readListState("bob", "memos"), {});
  clearListState();
  assert.deepEqual(readListState("alice", "memos"), {});
});
