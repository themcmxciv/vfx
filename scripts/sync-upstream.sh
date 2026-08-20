#!/usr/bin/env bash
set -euo pipefail

upstream_remote="${VFX_UPSTREAM_REMOTE:-upstream}"
upstream_branch="${VFX_UPSTREAM_BRANCH:-main}"
base_branch="${VFX_BASE_BRANCH:-main}"

if ! git diff --quiet || ! git diff --cached --quiet; then
	echo "Commit or stash changes before syncing upstream." >&2
	exit 1
fi

if ! git show-ref --verify --quiet "refs/heads/$base_branch"; then
	echo "Base branch does not exist: $base_branch" >&2
	exit 1
fi

git fetch "$upstream_remote" "$upstream_branch"
fx_sha="$(git rev-parse "$upstream_remote/$upstream_branch")"
sync_branch="sync/fx-${fx_sha:0:12}"

if git show-ref --verify --quiet "refs/heads/$sync_branch"; then
	echo "Sync branch already exists: $sync_branch" >&2
	exit 1
fi

git switch "$base_branch"
git switch -c "$sync_branch"
git merge --no-ff "$upstream_remote/$upstream_branch"
