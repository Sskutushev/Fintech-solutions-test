import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DashboardService {
  constructor(private readonly configService: ConfigService) {}

  async getSnapshot() {
    const producerUrl =
      this.configService.get<string>('PRODUCER_INTERNAL_URL') ??
      'http://producer:3001';
    const consumerUrl =
      this.configService.get<string>('CONSUMER_INTERNAL_URL') ??
      'http://consumer:3002';
    const notifierUrl =
      this.configService.get<string>('NOTIFIER_INTERNAL_URL') ??
      'http://notifier:3003';
    const rabbitApiUrl =
      this.configService.get<string>('RABBITMQ_MANAGEMENT_URL') ??
      'http://rabbitmq:15672/api';
    const rabbitUser =
      this.configService.get<string>('RABBITMQ_DEFAULT_USER') ?? 'guest';
    const rabbitPass =
      this.configService.get<string>('RABBITMQ_DEFAULT_PASS') ?? 'guest';

    const [
      producerHealth,
      consumerHealth,
      notifierHealth,
      producerActivity,
      consumerActivity,
      notifierActivity,
      queues,
      producerMetrics,
    ] = await Promise.all([
      this.safeGet(`${producerUrl}/health`),
      this.safeGet(`${consumerUrl}/health`),
      this.safeGet(`${notifierUrl}/health`),
      this.safeGet(`${producerUrl}/admin/activity`),
      this.safeGet(`${consumerUrl}/admin/activity`),
      this.safeGet(`${notifierUrl}/admin/activity`),
      this.safeGet(`${rabbitApiUrl}/queues`, {
        auth: { username: rabbitUser, password: rabbitPass },
      }),
      this.safeGet(`${producerUrl}/metrics`),
    ]);

    const health = {
      producer: this.healthFromResponse(producerHealth),
      consumer: this.healthFromResponse(consumerHealth),
      notifier: this.healthFromResponse(notifierHealth),
    };

    const queueItems = Array.isArray(queues?.data)
      ? queues.data.map((q: Record<string, unknown>) => ({
          name: q.name,
          ready: q.messages_ready,
          unacked: q.messages_unacknowledged,
          total: q.messages,
        }))
      : [];

    const alerts = this.buildAlerts(health, queueItems);

    return {
      timestamp: new Date().toISOString(),
      health,
      queues: queueItems,
      activity: {
        producer: this.activityItems(producerActivity?.data),
        consumer: this.activityItems(consumerActivity?.data),
        notifier: this.activityItems(notifierActivity?.data),
      },
      metrics: {
        producer: this.metricsPayload(producerMetrics?.data),
      },
      alerts,
    };
  }

  private metricsPayload(payload: unknown): string | null {
    return typeof payload === 'string' ? payload : null;
  }

  private buildAlerts(
    health: { producer: string; consumer: string; notifier: string },
    queues: Array<{ name: unknown; total: unknown }>,
  ): string[] {
    const alerts: string[] = [];

    for (const [service, state] of Object.entries(health)) {
      if (state !== 'up') {
        alerts.push(`Service down: ${service}`);
      }
    }

    const dlqWithMessages = queues.filter(
      (q) =>
        typeof q.name === 'string' &&
        q.name.includes('dlq') &&
        Number(q.total ?? 0) > 0,
    );
    if (dlqWithMessages.length > 0) {
      alerts.push(
        `DLQ has messages: ${dlqWithMessages.map((q) => q.name).join(', ')}`,
      );
    }

    return alerts;
  }

  private activityItems(payload: unknown): Record<string, unknown>[] {
    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const candidate = payload as { items?: unknown };
    if (!Array.isArray(candidate.items)) {
      return [];
    }

    return candidate.items.filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object',
    );
  }

  private healthFromResponse(
    response: { status: number; data?: unknown } | null,
  ): string {
    if (!response || response.status >= 400) {
      return 'down';
    }
    return 'up';
  }

  private async safeGet(url: string, config?: Record<string, unknown>) {
    try {
      return await axios.get(url, { timeout: 5000, ...(config ?? {}) });
    } catch {
      return null;
    }
  }
}
