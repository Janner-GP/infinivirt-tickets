import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';
import {
  STRONG_PASSWORD_MESSAGE,
  STRONG_PASSWORD_REGEX,
} from '../../../../common/constants/password-policy';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Sup3r$ecret!' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NuevaClave$2',
    description:
      'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo',
  })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE })
  newPassword: string;
}
