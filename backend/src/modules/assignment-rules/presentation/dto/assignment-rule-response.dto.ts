import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AssignmentRuleResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  subcategoryId: string;

  @Expose()
  @ApiProperty({ required: false })
  subcategoryName?: string;

  @Expose()
  @ApiProperty({ required: false })
  categoryId?: string;

  @Expose()
  @ApiProperty({ required: false })
  categoryName?: string;

  @Expose()
  @ApiProperty()
  agentId: string;

  @Expose()
  @ApiProperty({ required: false })
  agentName?: string;

  @Expose()
  @ApiProperty({ required: false })
  agentEmail?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<AssignmentRuleResponseDto>) {
    Object.assign(this, partial);
  }
}
