import { Controller, Get } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('activity')
  activity() {
    return { service: 'notifier', items: this.activityService.list() };
  }
}
