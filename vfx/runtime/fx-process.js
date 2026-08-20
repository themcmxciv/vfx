import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export class FxProcess {
  constructor(enginePath = locateFxEngine()) {
    this.child = spawn(enginePath, ["acp"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });
    this.stderr = readStream(this.child.stderr);
  }

  async close() {
    if (this.child.exitCode !== null) return;
    const closed = new Promise((resolve) => this.child.once("close", resolve));
    this.child.kill();
    await closed;
  }
}

export function locateFxEngine(options = {}) {
  const environment = options.environment ?? process.env;
  const exists = options.exists ?? existsSync;
  const directory = options.directory ?? dirname();
  if (environment.VFX_ENGINE_PATH) return environment.VFX_ENGINE_PATH;
  const installed = resolve(directory, "../../bin/fx");
  if (exists(installed)) return installed;
  const local = resolve(directory, "../../zig-out/bin/fx");
  if (exists(local)) return local;
  throw new Error("FX engine not found. Set VFX_ENGINE_PATH or install VFX.");
}

function dirname() {
  return resolve(fileURLToPath(import.meta.url), "..");
}

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let output = "";
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      output += chunk;
    });
    stream.on("end", () => resolve(output));
    stream.on("error", reject);
  });
}