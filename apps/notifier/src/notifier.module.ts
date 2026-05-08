import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { RabbitmqLibModule } from '@app/rabbitmq';
import { TelegramService } from './telegram/telegram.service';
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
    RabbitmqLibModule.forRoot(true),
  ],
  controllers: [HealthController, AdminController],
  providers: [TelegramService, ActivityService],
})
export class NotifierModule {}
