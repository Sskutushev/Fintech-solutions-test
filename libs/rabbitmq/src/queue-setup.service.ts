import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EXCHANGES, QUEUES, ROUTING_KEYS } from '@app/shared';

@Injectable()
export class QueueSetupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(QueueSetupService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onApplicationBootstrap(): Promise<void> {
    const channel = this.amqpConnection.channel;

    await channel.assertExchange(EXCHANGES.EVENTS, 'direct', { durable: true });
    await channel.assertExchange(EXCHANGES.RETRY, 'direct', { durable: true });
    await channel.assertExchange(EXCHANGES.DLQ, 'direct', { durable: true });
    await channel.assertExchange(EXCHANGES.NOTIFY, 'direct', { durable: true });

    await channel.assertQueue(QUEUES.EVENTS_DLQ, { durable: true });
    await channel.bindQueue(
      QUEUES.EVENTS_DLQ,
      EXCHANGES.DLQ,
      ROUTING_KEYS.EVENTS_DLQ,
    );

    await channel.assertQueue(QUEUES.EVENTS, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': EXCHANGES.DLQ,
        'x-dead-letter-routing-key': ROUTING_KEYS.EVENTS_DLQ,
      },
    });
    await channel.bindQueue(
      QUEUES.EVENTS,
      EXCHANGES.EVENTS,
      ROUTING_KEYS.EVENTS,
    );

    await channel.assertQueue(QUEUES.EVENTS_RETRY_10S, {
      durable: true,
      arguments: {
        'x-message-ttl': 10000,
        'x-dead-letter-exchange': EXCHANGES.EVENTS,
        'x-dead-letter-routing-key': ROUTING_KEYS.EVENTS,
      },
    });
    await channel.bindQueue(
      QUEUES.EVENTS_RETRY_10S,
      EXCHANGES.RETRY,
      ROUTING_KEYS.EVENTS_RETRY_10S,
    );

    await channel.assertQueue(QUEUES.EVENTS_RETRY_60S, {
      durable: true,
      arguments: {
        'x-message-ttl': 60000,
        'x-dead-letter-exchange': EXCHANGES.EVENTS,
        'x-dead-letter-routing-key': ROUTING_KEYS.EVENTS,
      },
    });
    await channel.bindQueue(
      QUEUES.EVENTS_RETRY_60S,
      EXCHANGES.RETRY,
      ROUTING_KEYS.EVENTS_RETRY_60S,
    );

    await channel.assertQueue(QUEUES.NOTIFY_DLQ, { durable: true });
    await channel.bindQueue(
      QUEUES.NOTIFY_DLQ,
      EXCHANGES.DLQ,
      ROUTING_KEYS.NOTIFY_DLQ,
    );

    await channel.assertQueue(QUEUES.NOTIFY, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': EXCHANGES.DLQ,
        'x-dead-letter-routing-key': ROUTING_KEYS.NOTIFY_DLQ,
      },
    });
    await channel.bindQueue(
      QUEUES.NOTIFY,
      EXCHANGES.NOTIFY,
      ROUTING_KEYS.NOTIFY,
    );

    this.logger.log('RabbitMQ topology is ready');
  }
}
