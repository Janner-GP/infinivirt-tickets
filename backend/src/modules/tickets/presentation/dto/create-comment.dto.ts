import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({
    required: false,
    description:
      'Solo Administrador y Supervisor pueden marcarlo como interno; para Agente siempre queda en false',
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
