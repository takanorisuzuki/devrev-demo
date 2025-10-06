#!/bin/bash
# Rollback to a previous Docker image version
# Usage: ./scripts/rollback.sh <version>
# Example: ./scripts/rollback.sh 1.0.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

TARGET_VERSION="${1:-}"

if [ -z "$TARGET_VERSION" ]; then
  echo "❌ Error: Version argument required" >&2
  echo "Usage: $0 <version>" >&2
  echo "Example: $0 1.0.0" >&2
  echo "" >&2
  echo "Available versions:" >&2
  docker images driverev-backend --format "{{.Tag}}" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?' | sort -V -r | head -5
  exit 1
fi

# Validate version format
if ! [[ "$TARGET_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Error: Invalid version format: $TARGET_VERSION" >&2
  echo "Expected format: MAJOR.MINOR.PATCH (e.g., 1.0.0)" >&2
  exit 1
fi

BACKEND_IMAGE="driverev-backend:${TARGET_VERSION}"
FRONTEND_IMAGE="driverev-frontend:${TARGET_VERSION}"
PROJECT_NAME="devrev-production"
COMPOSE_FILE="$PROJECT_ROOT/.github/compose.ci.yml"

echo "🔄 Rolling back to version: $TARGET_VERSION"

# Check if images exist
if ! docker image inspect "$BACKEND_IMAGE" > /dev/null 2>&1; then
  echo "❌ Error: Backend image not found: $BACKEND_IMAGE" >&2
  echo "Available backend versions:" >&2
  docker images driverev-backend --format "{{.Tag}}" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -5
  exit 1
fi

if ! docker image inspect "$FRONTEND_IMAGE" > /dev/null 2>&1; then
  echo "❌ Error: Frontend image not found: $FRONTEND_IMAGE" >&2
  echo "Available frontend versions:" >&2
  docker images driverev-frontend --format "{{.Tag}}" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -5
  exit 1
fi

echo "✅ Images found:"
echo "  - $BACKEND_IMAGE"
echo "  - $FRONTEND_IMAGE"

# Tag rollback images as 'test' (expected by compose file)
echo "🏷️  Tagging images for deployment..."
export BACKEND_IMAGE_TAG="${TARGET_VERSION}"
export FRONTEND_IMAGE_TAG="${TARGET_VERSION}"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
  echo "✅ Environment variables loaded"
else
  echo "⚠️  Warning: .env file not found, using defaults"
fi

# Stop current deployment
echo "🛑 Stopping current deployment..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down --remove-orphans || true

# Start rollback deployment
echo "🚀 Starting rollback deployment..."
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --wait --wait-timeout 300

echo "✅ Rollback to version $TARGET_VERSION complete!"
echo ""
echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo ""
echo "📊 Service status:"
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps

