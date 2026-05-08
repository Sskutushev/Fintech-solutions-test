import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { EventMessage, EXCHANGES, ROUTING_KEYS } from '@app/shared';

@Injectable()
export class NotificationPublisherService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishToNotifier(message: EventMessage): Promise<void> {
    await this.amqpConnection.publish(
      EXCHANGES.NOTIFY,
      ROUTING_KEYS.NOTIFY,
      message,
      {
        persistent: true,
        messageId: message.eventId,
        contentType: 'application/json',
      },
    );
  }

  async publishToRetry(
    message: EventMessage,
    retryCount: number,
  ): Promise<void> {
    const routingKey =
      retryCount === 1
        ? ROUTING_KEYS.EVENTS_RETRY_10S
        : ROUTING_KEYS.EVENTS_RETRY_60S;
    await this.amqpConnection.publish(EXCHANGES.RETRY, routingKey, message, {
      persistent: true,
      messageId: message.eventId,
      contentType: 'application/json',
    });
  }

  async publishToDlq(message: EventMessage): Promise<void> {
    await this.amqpConnection.publish(
      EXCHANGES.DLQ,
      ROUTING_KEYS.EVENTS_DLQ,
      message,
      {
        persistent: true,
        messageId: message.eventId,
        contentType: 'application/json',
      },
    );
  }
}
