import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

export interface ActivityItem {
  ts: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  eventId?: string;
  eventType?: string;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  private readonly items: ActivityItem[] = [];
  private readonly maxItems = 200;
  private readonly serviceName = 'consumer';
  private readonly pgClient: Client | null;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.get<string>('POSTGRES_URL');
    this.pgClient = connectionString ? new Client({ connectionString }) : null;
    if (this.pgClient) {
      void this.initPersistence();
    }
  }

  add(item: ActivityItem): void {
    this.items.unshift(item);
    if (this.items.length > this.maxItems) {
      this.items.length = this.maxItems;
    }
    void this.persist(item);
  }

  async list(): Promise<ActivityItem[]> {
    if (this.items.length > 0 || !this.pgClient) {
      return this.items;
    }

    try {
      const result = await this.pgClient.query(
        `SELECT ts, level, message, event_id AS "eventId", event_type AS "eventType"
         FROM activity_audit
         WHERE service_name = $1
         ORDER BY ts DESC
         LIMIT $2`,
        [this.serviceName, this.maxItems],
      );
      return result.rows as ActivityItem[];
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to load persisted activity: ${err.message}`);
      return this.items;
    }
  }

  private async initPersistence(): Promise<void> {
    try {
      await this.pgClient?.connect();
      await this.pgClient?.query(`
        CREATE TABLE IF NOT EXISTS activity_audit (
          id BIGSERIAL PRIMARY KEY,
          service_name TEXT NOT NULL,
          ts TIMESTAMPTZ NOT NULL,
          level TEXT NOT NULL,
          message TEXT NOT NULL,
          event_id TEXT,
          event_type TEXT
        )
      `);
      await this.pgClient?.query(
        'CREATE INDEX IF NOT EXISTS idx_activity_audit_service_ts ON activity_audit(service_name, ts DESC)',
      );
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Activity persistence unavailable: ${err.message}`);
    }
  }

  private async persist(item: ActivityItem): Promise<void> {
    if (!this.pgClient) {
      return;
    }

    try {
      await this.pgClient.query(
        `INSERT INTO activity_audit (service_name, ts, level, message, event_id, event_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          this.serviceName,
          item.ts,
          item.level,
          item.message,
          item.eventId ?? null,
          item.eventType ?? null,
        ],
      );
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Failed to persist activity: ${err.message}`);
    }
  }
}
