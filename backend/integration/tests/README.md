# MealMajor API Integration Tests

These tests go through the full API artifact, the same way a real client would interact with it. In these tests we use:
- A real PostgresSQL instance
- A real HTTP API

Our setup is supported by docker compose.

### Requirements

- Install [docker](https://www.docker.com/get-started/)

### Running test suite

- Run `npm run test:integration:docker`