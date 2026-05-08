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
}
