import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@infinivirt.test' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Sup3r$ecret!' })
  @IsString()
  @MinLength(1)
  password: string;
}
