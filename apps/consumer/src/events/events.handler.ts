import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import {
  EXCHANGES,
  IDEMPOTENCY_TTL_SECONDS,
  MAX_RETRIES,
  ROUTING_KEYS,
} from '@app/shared';
import type { EventMessage } from '@app/shared';
import { NotificationPublisherService } from '../notification-publisher.service';
import { ActivityService } from '../activity.service';

@Injectable()
export class EventsHandler {
  private readonly logger = new Logger(EventsHandler.name);

  constructor(
    private readonly notificationPublisherService: NotificationPublisherService,
    private readonly activityService: ActivityService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.EVENTS,
    queue: 'events.main.queue',
    allowNonJsonMessages: false,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': EXCHANGES.DLQ,
        'x-dead-letter-routing-key': ROUTING_KEYS.EVENTS_DLQ,
      },
    },
    errorHandler: (channel, msg) => {
      channel.nack(msg, false, false);
    },
  })
  async handleEvent(message: EventMessage): Promise<void> {
    const dedupeKey = `event:${message.eventId}`;
    const alreadyProcessed = await this.cacheManager.get(dedupeKey);

    if (alreadyProcessed) {
      this.logger.warn(`Duplicate event skipped: ${message.eventId}`);
      this.activityService.add({
        ts: new Date().toISOString(),
        level: 'warn',
        message: 'Duplicate event skipped',
        eventId: message.eventId,
        eventType: message.eventType,
      });
      return;
    }

    try {
      await this.notificationPublisherService.publishToNotifier(message);
      await this.cacheManager.set(
        dedupeKey,
        true,
        IDEMPOTENCY_TTL_SECONDS * 1000,
      );
      this.logger.log(`Event processed: ${message.eventId}`);
      this.activityService.add({
        ts: new Date().toISOString(),
        level: 'info',
        message: 'Event processed',
        eventId: message.eventId,
        eventType: message.eventType,
      });
    } catch {
      const retryCount = message.metadata.retryCount + 1;
      const nextMessage: EventMessage = {
        ...message,
        metadata: {
          ...message.metadata,
          retryCount,
        },
      };

      if (retryCount >= MAX_RETRIES) {
        await this.notificationPublisherService.publishToDlq(nextMessage);
        this.logger.error(`Max retries exceeded for event ${message.eventId}`);
        this.activityService.add({
          ts: new Date().toISOString(),
          level: 'error',
          message: 'Moved to DLQ after max retries',
          eventId: message.eventId,
          eventType: message.eventType,
        });
        return;
      }

      await this.notificationPublisherService.publishToRetry(
        nextMessage,
        retryCount,
      );
      this.logger.warn(
        `Retry scheduled for event ${message.eventId}, attempt ${retryCount}`,
      );
      this.activityService.add({
        ts: new Date().toISOString(),
        level: 'warn',
        message: `Retry scheduled (attempt ${retryCount})`,
        eventId: message.eventId,
        eventType: message.eventType,
      });
    }
  }
}
