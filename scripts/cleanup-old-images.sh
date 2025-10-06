#!/bin/bash
# Cleanup old Docker images, keeping only the most recent N versions
# Usage: ./scripts/cleanup-old-images.sh [keep_count]
# Default: keep 3 most recent versions

set -euo pipefail

KEEP_COUNT="${1:-3}"
BACKEND_IMAGE="driverev-backend"
FRONTEND_IMAGE="driverev-frontend"

echo "🧹 Cleaning up old Docker images (keeping ${KEEP_COUNT} most recent versions)..."

cleanup_image() {
  local image_name="$1"
  local keep_count="$2"
  
  echo "📦 Processing: $image_name"
  
  # Get all image IDs with version tags, sorted by creation time (newest first)
  # Filter out 'test', 'latest', and 'security-scan' tags
  local images=$(docker images --format "{{.ID}} {{.Tag}} {{.CreatedAt}}" "$image_name" | \
    grep -E ' [0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?' | \
    sort -k3 -r | \
    awk '{print $1}')
  
  if [ -z "$images" ]; then
    echo "  ℹ️  No versioned images found for $image_name"
    return 0
  fi
  
  local count=0
  local to_delete=()
  
  while IFS= read -r image_id; do
    count=$((count + 1))
    if [ $count -gt $keep_count ]; then
      to_delete+=("$image_id")
    fi
  done <<< "$images"
  
  if [ ${#to_delete[@]} -eq 0 ]; then
    echo "  ✅ No old images to delete (found ${count} version(s))"
  else
    echo "  🗑️  Deleting ${#to_delete[@]} old image(s)..."
    for image_id in $(printf "%s\n" "${to_delete[@]}" | sort -u); do
      docker rmi "$image_id" || echo "  ⚠️  Failed to delete image: $image_id (might be in use or already removed)"
    done
    echo "  ✅ Cleanup complete"
  fi
}

# Cleanup both backend and frontend images
cleanup_image "$BACKEND_IMAGE" "$KEEP_COUNT"
cleanup_image "$FRONTEND_IMAGE" "$KEEP_COUNT"

# Cleanup dangling images
echo "🧹 Removing dangling images..."
docker image prune -f > /dev/null 2>&1 || true

echo "✅ Image cleanup complete!"

