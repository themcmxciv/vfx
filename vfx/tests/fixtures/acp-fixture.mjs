#!/usr/bin/env node
import readline from "node:readline";

const input = readline.createInterface({ input: process.stdin });
input.on("line", (line) => {
  const request = JSON.parse(line);
  if (request.method === "session/prompt") {
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", method: "session/update", params: { sessionId: "vfx-test", update: { text: "VFX_OK" } } }) + "\n");
  }
  const result = request.method === "session/new" ? { sessionId: "vfx-test" } : { ok: true };
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }) + "\n");
});
