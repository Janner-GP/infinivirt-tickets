import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({
    required: false,
    description:
      'Obligatorio salvo cuando lo crea un Cliente (se toma de su propia cuenta)',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsUUID()
  subcategoryId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: TicketPriority })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiProperty({
    required: false,
    description:
      'Solo tiene efecto si lo crea un Administrador; si lo crea un Agente, se auto-asigna a sí mismo',
  })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
