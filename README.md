# Tournaments

Турнирный сервис: организаторы создают турниры в формате single elimination (Bo1 / Bo3 / Bo5), игроки регистрируются, сетка генерируется автоматически, рейтинг считается по Elo.

## Стек

- `src/api` — NestJS, Drizzle ORM, PostgreSQL 16, Swagger на `/api/docs`
- `src/web` — Vue 3, Vite, Vue Router, Pinia
- Тесты: Jest (`tests/api`), Vitest (`tests/web`)

## Требования

- Node.js 24 (`nvm use`)
- pnpm через corepack: `corepack enable`

## Запуск

```bash
pnpm install
pnpm build
pnpm --filter @tournaments/api start
pnpm --filter @tournaments/web dev
```

- API: http://localhost:3000/api/health
- Swagger: http://localhost:3000/api/docs
- Web: http://localhost:5173 (запросы `/api` проксируются на API)

Подключение к БД задаётся переменной `DATABASE_URL`.

## Скрипты

| Команда            | Описание                                         |
| ------------------ | ------------------------------------------------ |
| `pnpm lint`        | ESLint                                           |
| `pnpm format`      | Prettier                                         |
| `pnpm typecheck`   | `tsc --noEmit` / `vue-tsc --noEmit`              |
| `pnpm test`        | все тесты                                        |
| `pnpm test:unit`   | unit-тесты                                       |
| `pnpm test:int`    | интеграционные тесты                             |
| `pnpm build`       | сборка api и web                                 |
| `pnpm db:generate` | генерация миграции из `src/api/src/db/schema.ts` |
| `pnpm db:migrate`  | применение миграций (после `pnpm build`)         |

## Структура

```
src/api, src/web        исходный код
tests/api, tests/web    автотесты
load/                   сценарии k6
scripts/                скрипты курса
docs/01-planning … docs/04-metrics
.github/                CI, шаблон PR, CODEOWNERS
```
