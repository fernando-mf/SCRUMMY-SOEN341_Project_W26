#!/bin/bash
set -e

cleanup() {
  docker compose -f integration/docker-compose.yml down -v
}

trap cleanup EXIT

docker compose -f integration/docker-compose.yml up \
  --build \
  --exit-code-from tests \
  --abort-on-container-exit \
  tests