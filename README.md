# Notifications Platform

Fintech-oriented event platform on NestJS with RabbitMQ, Redis, Telegram delivery, and a visual admin dashboard.

## What Is Included

- `producer` (port `3001`): receives events via HTTP and publishes to RabbitMQ
- `consumer`: processes events with idempotency and retry/DLQ logic
- `notifier`: sends event notifications to Telegram with retry policy
- `admin` (port `3000`): manager-friendly dashboard with statuses, queue health, and activity feeds
- `rabbitmq` (port `15672`): broker management UI
- `redis`: idempotency storage for processed events

## Key Features

- Event idempotency (`eventId`/`idempotencyKey`)
- Retry queues (`10s`, `60s`) and DLQ routing
- Structured logs and in-memory activity feeds for operations
- Telegram notification formatting with readable metadata
- Two dashboard themes (Dark/Light) with animated gradient background

## Project Structure

```text
apps/
  producer/
  consumer/
  notifier/
  notifications-platform/  # admin dashboard + snapshot API
libs/
  shared/
  rabbitmq/
```

## Environment Setup

```bash
cp .env.example .env
```

Required values:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Run Locally in Docker

```bash
docker compose up --build
```

Endpoints:

- Admin Dashboard: `http://localhost:3000`
- Producer Swagger: `http://localhost:3001` (redirects to `/api`)
- RabbitMQ UI: `http://localhost:15672` (`guest/guest`)

## Generate Demo Data (for Dashboard Activity)

```bash
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"type":"payment.received","payload":{"userId":"u-100","amount":1500,"currency":"RUB"}}'

curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"type":"user.registered","payload":{"userId":"u-300","email":"user@example.com"}}'
```

Idempotency demo (send twice):

```bash
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"type":"payment.received","idempotencyKey":"11111111-1111-4111-8111-111111111111","payload":{"userId":"dup","amount":999}}'
```

Validation demo (expected `400`):

```bash
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"payload":{"oops":true}}'
```

## Quality Checks

Run full local gate:

```bash
npm run verify:release
```

This sequentially runs:

1. format check
2. eslint
3. typecheck
4. unit tests
5. e2e tests
6. build

## CI

GitHub Actions pipeline is split into sequential jobs (`needs` chain):

- `format` -> `eslint` -> `typecheck` -> `unit-tests` -> `e2e-tests` -> `build`
