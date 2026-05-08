import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { LoggerModule } from 'nestjs-pino';
import { RabbitmqLibModule } from '@app/rabbitmq';
import { EventsHandler } from './events/events.handler';
import { NotificationPublisherService } from './notification-publisher.service';
import { HealthController } from './health.controller';
import { ActivityService } from './activity.service';
import { AdminController } from './admin.controller';

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
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: config.getOrThrow<string>('REDIS_HOST'),
            port: Number(config.getOrThrow<string>('REDIS_PORT')),
          },
        }),
      }),
    }),
    RabbitmqLibModule.forRoot(true),
  ],
  controllers: [HealthController, AdminController],
  providers: [EventsHandler, NotificationPublisherService, ActivityService],
})
export class ConsumerModule {}
