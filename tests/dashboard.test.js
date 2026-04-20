import test from "node:test";
import assert from "node:assert/strict";
import { buildRecentActivities } from "../src/features/dashboard/lib/activity.js";

test("buildRecentActivities merges notes and tasks in descending order", () => {
  const activities = buildRecentActivities(
    [{ id: "n1", title: "Memo", updatedAt: "2026-04-20T12:00:00.000Z" }],
    [
      { id: 100, text: "Todo A", completed: false },
      { id: 200, text: "Todo B", completed: true },
    ],
  );

  assert.equal(activities.length, 3);
  assert.equal(activities[0].id, "note-n1");
  assert.match(activities[1].text, /Completed|Added/);
});
