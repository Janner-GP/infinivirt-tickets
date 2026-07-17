import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateAssignmentRuleDto {
  @ApiProperty()
  @IsUUID()
  subcategoryId: string;

  @ApiProperty()
  @IsUUID()
  agentId: string;
}
