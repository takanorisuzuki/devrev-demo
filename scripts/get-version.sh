#!/bin/bash
# Get semantic version for Docker image tagging
# Usage: ./scripts/get-version.sh [--with-sha]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION_FILE="$PROJECT_ROOT/VERSION"

# Read base version from VERSION file
if [ ! -f "$VERSION_FILE" ]; then
  echo "ERROR: VERSION file not found at $VERSION_FILE" >&2
  exit 1
fi

BASE_VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')

# Validate semantic version format
if ! [[ "$BASE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "ERROR: Invalid version format in VERSION file: $BASE_VERSION" >&2
  echo "Expected format: MAJOR.MINOR.PATCH (e.g., 1.0.0)" >&2
  exit 1
fi

# Output version with optional SHA suffix
if [ "${1:-}" = "--with-sha" ]; then
  if [ -n "${GITHUB_SHA:-}" ]; then
    SHORT_SHA="${GITHUB_SHA:0:7}"
    echo "${BASE_VERSION}-${SHORT_SHA}"
  else
    # Local development fallback
    SHORT_SHA=$(git rev-parse --short=7 HEAD 2>/dev/null || echo "local")
    echo "${BASE_VERSION}-${SHORT_SHA}"
  fi
else
  echo "$BASE_VERSION"
fi

