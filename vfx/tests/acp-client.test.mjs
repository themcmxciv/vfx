import { chmodSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import { AcpClient } from "../runtime/acp-client.js";
import { createSession } from "../runtime/session.js";

test("initializes, prompts, and forwards stream events", async () => {
  const fixture = join(fileURLToPath(new URL(".", import.meta.url)), "fixtures/acp-fixture.mjs");
  chmodSync(fixture, 0o755);
  const client = await AcpClient.start(fixture);
  const events = [];
  const session = await createSession(client, (event) => events.push(event.method));
  await session.prompt("Return exactly VFX_OK");
  assert.equal(session.id, "vfx-test");
  assert.deepEqual(events, ["session/update"]);
  await session.close();
});