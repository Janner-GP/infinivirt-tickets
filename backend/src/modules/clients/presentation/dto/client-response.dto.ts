import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ClientResponseDto {
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
  @ApiProperty({ required: false, nullable: true })
  company: string | null;

  @Expose()
  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<ClientResponseDto>) {
    Object.assign(this, partial);
  }
}
