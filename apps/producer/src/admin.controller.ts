import { Controller, Get } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('activity')
  async activity() {
    return { service: 'producer', items: await this.activityService.list() };
  }
}
