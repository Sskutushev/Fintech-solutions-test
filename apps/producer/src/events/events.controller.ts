import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEventDto } from '@app/shared';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publish event to RabbitMQ' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({ status: 201, description: 'Event published' })
  async publish(@Body() dto: CreateEventDto): Promise<{ id: string }> {
    return this.eventsService.publish(dto);
  }
}
