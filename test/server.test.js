import { test } from "node:test";
import assert from "node:assert";
import { reels, catalog } from "../src/reels.js";

test("every reel has at least one frame and catalog matches", () => {
  for (const [id, r] of Object.entries(reels)) {
    assert.ok(r.frames.length > 0, id);
    assert.strictEqual(catalog.find((c) => c.id === id).frames, r.frames.length);
  }
});
