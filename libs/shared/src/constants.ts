export const SERVICE_NAME = {
  PRODUCER: 'producer',
  CONSUMER: 'consumer',
  NOTIFIER: 'notifier',
} as const;

export const EXCHANGES = {
  EVENTS: 'events.exchange',
  RETRY: 'events.retry.exchange',
  DLQ: 'events.dlq.exchange',
  NOTIFY: 'notify.exchange',
} as const;

export const QUEUES = {
  EVENTS: 'events.main.queue',
  EVENTS_RETRY_10S: 'events.retry.10s.queue',
  EVENTS_RETRY_60S: 'events.retry.60s.queue',
  EVENTS_DLQ: 'events.dlq.queue',
  NOTIFY: 'notify.main.queue',
  NOTIFY_DLQ: 'notify.dlq.queue',
} as const;

export const ROUTING_KEYS = {
  EVENTS: 'events.main',
  EVENTS_RETRY_10S: 'events.retry.10s',
  EVENTS_RETRY_60S: 'events.retry.60s',
  EVENTS_DLQ: 'events.dlq',
  NOTIFY: 'notify.main',
  NOTIFY_DLQ: 'notify.dlq',
} as const;

export const MAX_RETRIES = 3;

export const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24;
