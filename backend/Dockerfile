FROM node:25-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# API runner
FROM base AS api
COPY src ./src
COPY tsoa.json ./tsoa.json
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]

# Migrations runner
FROM base AS migrations
COPY integration/migrations ./integration/migrations
COPY scripts/migrate.js ./migrate.js
CMD ["node", "migrate.js"]

# Test runner
FROM api AS tests
COPY integration/tests ./integration/tests
COPY vitest.integration.config.ts ./
CMD ["npm", "run", "test:integration"]