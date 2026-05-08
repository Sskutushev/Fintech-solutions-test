import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  CreateEventDto,
  EventMessage,
  EXCHANGES,
  ROUTING_KEYS,
  SERVICE_NAME,
} from '@app/shared';
import { randomUUID } from 'node:crypto';
import { ActivityService } from '../activity.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly publishAttempts = 3;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly activityService: ActivityService,
  ) {}

  async publish(dto: CreateEventDto): Promise<{ id: string }> {
    const message: EventMessage = {
      eventId: dto.idempotencyKey ?? randomUUID(),
      eventType: dto.type,
      payload: dto.payload,
      occurredAt: new Date().toISOString(),
      producer: SERVICE_NAME.PRODUCER,
      version: 1,
      tenantId: dto.tenantId,
      metadata: {
        correlationId: randomUUID(),
        retryCount: 0,
      },
    };

    try {
      await this.publishWithRetry(message);
      this.logger.log(
        `Event published: id=${message.eventId} type=${message.eventType}`,
      );
      this.activityService.add({
        ts: new Date().toISOString(),
        level: 'info',
        message: 'Event published',
        eventId: message.eventId,
        eventType: message.eventType,
      });
      return { id: message.eventId };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to publish event: ${err.message}`, err.stack);
      this.activityService.add({
        ts: new Date().toISOString(),
        level: 'error',
        message: `Publish failed: ${err.message}`,
        eventId: message.eventId,
        eventType: message.eventType,
      });
      throw new InternalServerErrorException('Failed to publish event');
    }
  }

  private async publishWithRetry(message: EventMessage): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.publishAttempts; attempt += 1) {
      try {
        await this.amqpConnection.publish(
          EXCHANGES.EVENTS,
          ROUTING_KEYS.EVENTS,
          message,
          {
            persistent: true,
            messageId: message.eventId,
            contentType: 'application/json',
          },
        );
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.publishAttempts) {
          const delayMs = attempt * 300;
          this.logger.warn(
            `Publish retry ${attempt}/${this.publishAttempts - 1} for ${message.eventId} in ${delayMs}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError ?? new Error('Unknown publish error');
  }
}
