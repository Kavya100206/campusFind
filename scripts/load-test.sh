#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost}"
DURATION="${DURATION:-75}"
CONCURRENCY="${CONCURRENCY:-6}"

echo "================================================="
echo "Starting CampusFind Load Test"
echo "Target: ${BASE_URL}"
echo "Duration: ~${DURATION}s (Concurrency: ${CONCURRENCY})"
echo "================================================="

END_TIME=$((SECONDS + DURATION))

run_worker() {
  local worker_id=$1
  local count=0
  while [ $SECONDS -lt $END_TIME ]; do
    # 1. List all items
    curl -s -o /dev/null "${BASE_URL}/api/items" 2>&1 || true

    # 2. Filtered list by status
    curl -s -o /dev/null "${BASE_URL}/api/items?status=LOST" 2>&1 || true

    # 3. Filtered list by category
    curl -s -o /dev/null "${BASE_URL}/api/items?category=ELECTRONICS" 2>&1 || true

    # 4. Search query
    curl -s -o /dev/null "${BASE_URL}/api/items?search=headphones" 2>&1 || true

    # 5. Non-existent item (exercises 404 route handling)
    curl -s -o /dev/null "${BASE_URL}/api/items/99999" 2>&1 || true

    count=$((count + 5))
    sleep 0.02
  done
  echo "Worker $worker_id completed ~$count requests."
}

# Run concurrent background workers
pids=()
for i in $(seq 1 "$CONCURRENCY"); do
  run_worker "$i" &
  pids+=($!)
done

# Wait for all workers to complete
for pid in "${pids[@]}"; do
  wait "$pid"
done

echo "================================================="
echo "Load test completed successfully."
echo "================================================="
