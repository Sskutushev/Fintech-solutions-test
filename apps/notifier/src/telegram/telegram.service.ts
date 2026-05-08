import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { EXCHANGES, ROUTING_KEYS, sleep } from '@app/shared';
import type { EventMessage } from '@app/shared';
import { ActivityService } from '../activity.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot!: TelegramBot;

  constructor(
    private readonly config: ConfigService,
    private readonly activityService: ActivityService,
  ) {}

  onModuleInit(): void {
    const token = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    this.bot = new TelegramBot(token);
  }

  @RabbitSubscribe({
    exchange: EXCHANGES.NOTIFY,
    routingKey: ROUTING_KEYS.NOTIFY,
    queue: 'notify.main.queue',
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': EXCHANGES.DLQ,
        'x-dead-letter-routing-key': ROUTING_KEYS.NOTIFY_DLQ,
      },
    },
  })
  async handleNotify(message: EventMessage): Promise<void> {
    await this.sendNotification(message);
  }

  async sendNotification(message: EventMessage): Promise<void> {
    const chatId = this.config.getOrThrow<string>('TELEGRAM_CHAT_ID');
    const text = this.formatMessage(message);

    await this.withRetry(() =>
      this.bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    );

    this.logger.log(`Telegram notification sent for event ${message.eventId}`);
    this.activityService.add({
      ts: new Date().toISOString(),
      level: 'info',
      message: 'Telegram notification sent',
      eventId: message.eventId,
      eventType: message.eventType,
    });
  }

  private formatMessage(message: EventMessage): string {
    const utcTime = new Date(message.occurredAt)
      .toISOString()
      .replace('T', ' ')
      .replace('Z', ' UTC');
    const localTime = new Date(message.occurredAt).toLocaleString('ru-RU', {
      hour12: false,
      timeZoneName: 'short',
    });

    const title = this.resolveEventTitle(message.eventType);
    const payloadJson = this.escapeHtml(
      JSON.stringify(message.payload, null, 2),
    );

    return [
      '<b>FINTECH EVENT</b>',
      '',
      `<b>${title}</b>`,
      `<b>Type:</b> <code>${this.escapeHtml(message.eventType)}</code>`,
      `<b>Event ID:</b> <code>${this.escapeHtml(message.eventId)}</code>`,
      `<b>Time (UTC):</b> <code>${this.escapeHtml(utcTime)}</code>`,
      `<b>Time (Local):</b> <code>${this.escapeHtml(localTime)}</code>`,
      `<b>Producer:</b> <code>${this.escapeHtml(message.producer)}</code>`,
      `<b>Version:</b> <code>v${message.version}</code>`,
      `<b>Correlation ID:</b> <code>${this.escapeHtml(message.metadata.correlationId)}</code>`,
      '',
      '<b>Payload</b>',
      `<pre>${payloadJson}</pre>`,
    ].join('\n');
  }

  private resolveEventTitle(eventType: string): string {
    if (eventType.startsWith('payment.')) {
      return 'Payment Notification';
    }
    if (eventType.startsWith('user.')) {
      return 'User Notification';
    }
    return 'System Notification';
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private async withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < attempts; i += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const telegramError = error as {
          response?: {
            statusCode?: number;
            body?: { parameters?: { retry_after?: number } };
          };
        };

        if (telegramError.response?.statusCode === 429) {
          const retryAfter =
            telegramError.response.body?.parameters?.retry_after ?? 3;
          this.logger.warn(
            `Rate limit from Telegram. Retrying in ${retryAfter}s`,
          );
          this.activityService.add({
            ts: new Date().toISOString(),
            level: 'warn',
            message: `Telegram rate limit, retry in ${retryAfter}s`,
          });
          await sleep(retryAfter * 1000);
          continue;
        }

        if (i < attempts - 1) {
          await sleep((i + 1) * 1000);
          continue;
        }
      }
    }

    this.activityService.add({
      ts: new Date().toISOString(),
      level: 'error',
      message: 'Telegram send failed after retries',
    });
    throw lastError;
  }
}
