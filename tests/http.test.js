import test from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage, normalizeHttpError, unwrapData } from "../src/shared/api/http.js";

test("unwrapData returns nested data payload", () => {
  assert.deepEqual(unwrapData({ data: { data: { ok: true } } }), { ok: true });
});

test("normalizeHttpError keeps API message", () => {
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
  assert.equal(getErrorMessage(error), "invalid password");
});
