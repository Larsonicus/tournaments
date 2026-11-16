FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY src/api/package.json src/api/
COPY src/web/package.json src/web/
RUN pnpm install --frozen-lockfile --filter @tournaments/web...
COPY src/web src/web
RUN pnpm --filter @tournaments/web build

FROM nginx:1.27-alpine
COPY src/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/src/web/dist /usr/share/nginx/html
EXPOSE 80
