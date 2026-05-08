import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  private initialized = false;

  init(): void {
    if (this.initialized) {
      return;
    }
    collectDefaultMetrics({ prefix: 'producer_' });
    this.initialized = true;
  }
}
