FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY src/api/package.json src/api/
COPY src/web/package.json src/web/
RUN pnpm install --frozen-lockfile --filter @tournaments/api...
COPY src/api src/api
RUN pnpm --filter @tournaments/api build \
 && pnpm --filter @tournaments/api deploy --prod --legacy /out

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3000
CMD ["sh", "-c", "node dist/db/migrate.js && exec node dist/main.js"]
