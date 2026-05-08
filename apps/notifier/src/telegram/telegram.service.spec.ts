import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { Logger } from '@nestjs/common';
import { ActivityService } from '../activity.service';

jest.mock('node-telegram-bot-api', () => {
  return jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn(),
  }));
});

describe('TelegramService', () => {
  const configService = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        TELEGRAM_BOT_TOKEN: 'token',
        TELEGRAM_CHAT_ID: '-1000',
      };
      return values[key];
    }),
  } as unknown as ConfigService;

  it('retries on 429 rate limit', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();

    const activityService = { add: jest.fn() } as unknown as ActivityService;
    const service = new TelegramService(configService, activityService);
    service.onModuleInit();

    const bot = (service as unknown as { bot: { sendMessage: jest.Mock } }).bot;
    const error = {
      response: { statusCode: 429, body: { parameters: { retry_after: 0 } } },
    };
    bot.sendMessage.mockRejectedValueOnce(error).mockResolvedValueOnce({});

    await service.sendNotification({
      eventId: 'id-1',
      eventType: 'test',
      occurredAt: new Date().toISOString(),
      payload: {},
      producer: 'producer',
      version: 1,
      metadata: { correlationId: 'corr', retryCount: 0 },
    });

    expect(bot.sendMessage).toHaveBeenCalledTimes(2);
  });
});
