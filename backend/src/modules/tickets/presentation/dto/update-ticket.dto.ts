import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTicketDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TicketPriority, required: false })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}
