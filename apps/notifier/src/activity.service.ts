import { Injectable } from '@nestjs/common';

export interface ActivityItem {
  ts: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  eventId?: string;
  eventType?: string;
}

@Injectable()
export class ActivityService {
  private readonly items: ActivityItem[] = [];
  private readonly maxItems = 200;

  add(item: ActivityItem): void {
    this.items.unshift(item);
    if (this.items.length > this.maxItems) {
      this.items.length = this.maxItems;
    }
  }

  list(): ActivityItem[] {
    return this.items;
  }
}
