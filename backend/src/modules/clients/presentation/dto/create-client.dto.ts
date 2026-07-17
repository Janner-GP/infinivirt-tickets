import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'contacto@acme.test' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Acme Corporation', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ example: '+57 300 1234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
