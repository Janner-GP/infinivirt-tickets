import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateSubcategoryDto {
  @ApiProperty({ example: 'VPN' })
  @IsString()
  name: string;
}
