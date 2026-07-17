import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Accesos y credenciales' })
  @IsString()
  name: string;
}
