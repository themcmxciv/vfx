```

               ░████
              ░██
░██    ░██ ░████████ ░██    ░██
░██    ░██    ░██     ░██  ░██
 ░██  ░██     ░██      ░█████
  ░██░██      ░██     ░██  ░██
   ░███       ░██    ░██    ░██

```

VFX is a Node.js wrapper around the FX coding-agent engine.

## Features

- Runs the published FX binary without Bun or Zig.
- Sends one-shot agent requests with `vfx ask`.
- Supports OpenAI-compatible model providers, including local endpoints.
- Checks provider connectivity with `vfx doctor`.
- Lists configured provider types with `vfx provider list`.
- Reports VFX, FX upstream, and protocol versions with `vfx --version`.
- Uses `VFX_ENGINE_PATH` to select a custom FX binary.

## Install

Requires Node.js 18 or later:

```bash
curl -fsSL https://raw.githubusercontent.com/themcmxciv/vfx/main/install.sh | bash
```

The installer downloads VFX to `~/.vfx`, fetches the matching FX release binary, and links `vfx` into `~/.local/bin`.

## Run VFX

VFX uses an OpenAI-compatible provider. By default it connects to
`http://127.0.0.1:11434/v1`; override the endpoint, model, and API key as needed:

```bash
export VFX_OPENAI_BASE_URL=https://api.example.com/v1
export VFX_MODEL=your-model
export OPENAI_API_KEY=your-api-key
```

Check the configured provider:

```bash
vfx provider list
vfx doctor
```

Send a one-shot request:

```bash
vfx ask "explain this repository"
```

Set `VFX_ENGINE_PATH` to use a different FX binary.

## Update FX

Sync the latest FX upstream commit into a review branch:

```bash
scripts/sync-upstream.sh
```

The working tree must be clean. The script creates `sync/fx-<commit>` from `main` and merges `upstream/main`. Override its branches with `VFX_BASE_BRANCH` and `VFX_UPSTREAM_BRANCH` when needed.
