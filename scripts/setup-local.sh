#!/usr/bin/env bash
set -euo pipefail
exclude="$(git rev-parse --git-path info/exclude)"
touch "$exclude"
for pattern in "/node_modules/" "/.next/" "/.env.local" "/founder/" "/package-lock.json"; do
  grep -qxF "$pattern" "$exclude" || printf '%s\n' "$pattern" >> "$exclude"
done
echo "Local generated files and secrets are now excluded without changing the upstream .gitignore."
