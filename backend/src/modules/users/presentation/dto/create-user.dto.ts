import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  STRONG_PASSWORD_MESSAGE,
  STRONG_PASSWORD_REGEX,
} from '../../../../common/constants/password-policy';

export class CreateUserDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ada@infinivirt.test' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Sup3r$ecret!',
    description:
      'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo',
  })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({ enum: Role, example: Role.AGENT })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    required: false,
    description:
      'Obligatorio cuando role = CLIENT: vincula la cuenta con un registro de Cliente existente',
  })
  @ValidateIf((dto: CreateUserDto) => dto.role === Role.CLIENT)
  @IsUUID()
  clientId?: string;
}
