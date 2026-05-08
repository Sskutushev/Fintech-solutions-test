import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EventsController } from '../apps/producer/src/events/events.controller';
import { EventsService } from '../apps/producer/src/events/events.service';
import { ActivityService } from '../apps/producer/src/activity.service';

describe('Producer (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        EventsService,
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ActivityService,
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/events (POST) returns id', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const res: { body: { id: string } } = await request(httpServer)
      .post('/events')
      .send({
        type: 'payment.received',
        payload: { amount: 100 },
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
  });
});
