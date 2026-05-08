import { Test } from '@nestjs/testing';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { InternalServerErrorException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Logger } from '@nestjs/common';
import { ActivityService } from '../activity.service';

describe('EventsService', () => {
  let service: EventsService;
  let amqpConnection: jest.Mocked<AmqpConnection>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: AmqpConnection,
          useValue: { publish: jest.fn() },
        },
        {
          provide: ActivityService,
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(EventsService);
    amqpConnection = moduleRef.get(AmqpConnection);
  });

  it('publishes event with generated UUID', async () => {
    amqpConnection.publish.mockResolvedValue(true);
    const result = await service.publish({ type: 'test', payload: {} });
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(amqpConnection.publish.mock.calls).toHaveLength(1);
  });

  it('uses provided idempotency key', async () => {
    const key = '8f2f1616-0211-40a8-b95b-29793aa1a34a';
    amqpConnection.publish.mockResolvedValue(true);
    const result = await service.publish({
      type: 'test',
      payload: {},
      idempotencyKey: key,
    });
    expect(result.id).toBe(key);
  });

  it('throws on publish failure', async () => {
    amqpConnection.publish.mockRejectedValue(new Error('AMQP error'));
    await expect(
      service.publish({ type: 'test', payload: {} }),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
