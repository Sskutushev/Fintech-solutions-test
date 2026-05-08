import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'payment.received' })
  @IsString()
  type!: string;

  @ApiProperty({ example: { userId: 'u-1', amount: 1000, currency: 'RUB' } })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Client-provided idempotency key in UUID v4 format',
    example: '8f2f1616-0211-40a8-b95b-29793aa1a34a',
  })
  @IsUUID('4')
  @IsOptional()
  idempotencyKey?: string;

  @ApiPropertyOptional({ example: 'tenant-1' })
  @IsString()
  @IsOptional()
  tenantId?: string;
}
