#!/bin/bash
set -e

cleanup() {
  docker compose -f docker-compose.yml down -v
}

trap cleanup EXIT

docker compose -f docker-compose.yml up \
  --build \
  --exit-code-from e2e \
  --abort-on-container-exit \
  e2e
