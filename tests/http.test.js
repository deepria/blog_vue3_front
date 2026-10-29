import test from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage, normalizeHttpError, unwrapData } from "../src/shared/api/http.js";
import { normalizeTodo } from "../src/features/todo/lib/todoModel.js";
import { assertOnline, OFFLINE_MESSAGE } from "../src/shared/utils/network.js";

test("unwrapData returns nested data payload", () => {
  assert.deepEqual(unwrapData({ data: { data: { ok: true } } }), { ok: true });
});

test("normalizeHttpError preserves technical details and provides a Korean user message", () => {
  const error = normalizeHttpError({
    response: {
      status: 401,
      data: {
        error: {
          code: "unauthorized",
          message: "invalid password",
        },
      },
    },
  });

  assert.equal(error.status, 401);
  assert.equal(error.code, "unauthorized");
  assert.equal(error.technicalMessage, "invalid password");
  assert.equal(getErrorMessage(error), "보호 키를 확인한 뒤 다시 시도해 주세요.");
});

test("network failures use the shared offline message", () => {
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator",
  );
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { onLine: false },
  });

  try {
    const error = normalizeHttpError(new Error("Network Error"));
    assert.equal(error.code, "offline");
    assert.equal(getErrorMessage(error), OFFLINE_MESSAGE);
    assert.throws(assertOnline, (offlineError) => {
      return (
        offlineError.code === "offline" &&
        offlineError.userMessage === OFFLINE_MESSAGE
      );
    });
  } finally {
    if (navigatorDescriptor) {
      Object.defineProperty(globalThis, "navigator", navigatorDescriptor);
    } else {
      delete globalThis.navigator;
    }
  }
});

test("normalizeTodo supplies stable UI defaults for API payloads", () => {
  assert.deepEqual(normalizeTodo({ id: 1, completed: 1 }), {
    id: 1,
    text: "",
    groupKey: null,
    priorityKey: null,
    completed: true,
  });
});
