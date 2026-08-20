#!/usr/bin/env bash
set -euo pipefail

VFX_REPOSITORY="${VFX_REPOSITORY:-themcmxciv/vfx}"
VFX_REF="${VFX_REF:-main}"
VFX_INSTALL_DIR="${VFX_INSTALL_DIR:-$HOME/.vfx}"
VFX_BIN_DIR="${VFX_BIN_DIR:-$HOME/.local/bin}"
FX_RELEASE_REPOSITORY="vercel-labs/fx"

for command in chmod curl find install ln mkdir mktemp node tar uname; do
  command -v "$command" >/dev/null || {
    echo "Missing required command: $command" >&2
    exit 1
  }
done

case "$(uname -s)" in
  Darwin) platform="macos" ;;
  Linux) platform="linux" ;;
  *) echo "Unsupported operating system: $(uname -s)" >&2; exit 1 ;;
esac

case "$(uname -m)" in
  arm64|aarch64) architecture="aarch64" ;;
  x86_64|amd64) architecture="x86_64" ;;
  *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

temporary_directory="$(mktemp -d)"
trap 'rm -rf "$temporary_directory"' EXIT
raw_base="${VFX_RAW_BASE:-https://raw.githubusercontent.com/$VFX_REPOSITORY/$VFX_REF}"

mkdir -p "$VFX_INSTALL_DIR/bin" "$VFX_INSTALL_DIR/vfx" "$VFX_BIN_DIR"

download_wrapper_file() {
  local file="$1"
  mkdir -p "$(dirname "$VFX_INSTALL_DIR/$file")"
  curl --fail --location --silent --show-error "$raw_base/$file" -o "$VFX_INSTALL_DIR/$file"
}

for file in \
  bin/vfx \
  package.json \
  vfx/version.js \
  vfx/cli/index.js \
  vfx/config/config.js \
  vfx/providers/openai-compatible.js \
  vfx/providers/registry.js \
  vfx/runtime/acp-client.js \
  vfx/runtime/fx-process.js \
  vfx/runtime/session.js; do
  download_wrapper_file "$file"
done

chmod +x "$VFX_INSTALL_DIR/bin/vfx"
fx_archive="fx-$platform-$architecture.tar.gz"
fx_release_url="${FX_RELEASE_URL:-https://github.com/$FX_RELEASE_REPOSITORY/releases/latest/download/$fx_archive}"
curl --fail --location --silent --show-error \
  "$fx_release_url" \
  -o "$temporary_directory/$fx_archive"
tar -xzf "$temporary_directory/$fx_archive" -C "$temporary_directory"
fx_binary="$(find "$temporary_directory" -type f -name fx -perm -u+x -print -quit)"

if [[ -z "$fx_binary" ]]; then
  echo "FX release archive did not contain an executable." >&2
  exit 1
fi

install -m 755 "$fx_binary" "$VFX_INSTALL_DIR/bin/fx"
ln -sf "$VFX_INSTALL_DIR/bin/vfx" "$VFX_BIN_DIR/vfx"

echo "Installed VFX to $VFX_BIN_DIR/vfx"
case ":$PATH:" in
  *":$VFX_BIN_DIR:"*) ;;
  *) echo "Add $VFX_BIN_DIR to PATH, then run: vfx --help" ;;
esac