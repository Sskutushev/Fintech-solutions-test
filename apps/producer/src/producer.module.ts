import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { RabbitmqLibModule } from '@app/rabbitmq';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { HealthController } from './health.controller';
import { RootController } from './root.controller';
import { ActivityService } from './activity.service';
import { AdminController } from './admin.controller';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    RabbitmqLibModule.forRoot(true),
  ],
  controllers: [
    RootController,
    EventsController,
    HealthController,
    AdminController,
    MetricsController,
  ],
  providers: [EventsService, ActivityService, MetricsService],
})
export class ProducerModule {}
