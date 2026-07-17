import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

/**
 * Nunca se expone passwordHash — @Exclude por defecto + @Expose explícito por campo,
 * combinado con ClassSerializerInterceptor global (ver main.ts).
 */
@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({ enum: Role })
  role: Role;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty({ required: false, nullable: true })
  clientId: string | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
