import assert from "node:assert/strict";
import { test } from "node:test";
import { locateFxEngine } from "../runtime/fx-process.js";

test("locates the binary installed beside the VFX wrapper", () => {
  const directory = "/home/user/.vfx/vfx/runtime";
  const installed = "/home/user/.vfx/bin/fx";
  assert.equal(
    locateFxEngine({
      directory,
      environment: {},
      exists: (path) => path === installed,
    }),
    installed,
  );
});

test("prefers an explicit engine path", () => {
  assert.equal(
    locateFxEngine({
      environment: { VFX_ENGINE_PATH: "/custom/fx" },
      exists: () => false,
    }),
    "/custom/fx",
  );
});