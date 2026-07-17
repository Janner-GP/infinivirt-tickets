import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @ApiProperty({ example: 'VPN' })
  @IsString()
  name: string;
}
