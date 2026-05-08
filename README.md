# Notifications Platform

Microservice platform on NestJS for event processing with RabbitMQ and Telegram delivery.

## Services

- `producer`: HTTP API (`POST /events`) + Swagger (`/api`)
- `consumer`: event processor with idempotency (Redis) and retry routing
- `notifier`: Telegram sender with retry on rate limits

## Architecture

```text
HTTP Client -> Producer -> RabbitMQ events.exchange -> Consumer -> RabbitMQ notify.exchange -> Notifier -> Telegram Bot API
                                 |                    | retry.10s / retry.60s / DLQ
                                 +--------------------+

Redis is used for idempotency keys in consumer.
```

## Requirements

- Node.js 20+
- Docker + Docker Compose

## Environment

```bash
cp .env.example .env
```

Fill values:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Run in Docker

```bash
docker compose up --build
```

- Producer API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api`
- RabbitMQ UI: `http://localhost:15672` (`guest/guest`)

## Local Run

```bash
npm install
npm run start:producer:dev
npm run start:consumer:dev
npm run start:notifier:dev
```

## Test request

```bash
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"type":"payment.received","payload":{"amount":1000,"currency":"RUB"}}'
```

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## CI

GitHub Actions workflow `.github/workflows/ci.yml` runs format, lint, typecheck, unit tests, e2e tests, and build on each PR/push.
