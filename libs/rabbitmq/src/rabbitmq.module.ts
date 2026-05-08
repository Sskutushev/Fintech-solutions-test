import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueSetupService } from './queue-setup.service';

@Module({})
export class RabbitmqLibModule {
  static forRoot(setupQueues = false): DynamicModule {
    return {
      module: RabbitmqLibModule,
      imports: [
        ConfigModule,
        RabbitMQModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            exchanges: [
              { name: 'events.exchange', type: 'direct' },
              { name: 'events.retry.exchange', type: 'direct' },
              { name: 'events.dlq.exchange', type: 'direct' },
              { name: 'notify.exchange', type: 'direct' },
            ],
            uri: config.getOrThrow<string>('RABBITMQ_URL'),
            connectionInitOptions: { wait: true, timeout: 10000 },
            channels: {
              default: {
                prefetchCount: Number(config.get('RABBITMQ_PREFETCH') ?? 10),
                default: true,
              },
            },
          }),
        }),
      ],
      providers: setupQueues ? [QueueSetupService] : [],
      exports: [RabbitMQModule],
    };
  }
}
