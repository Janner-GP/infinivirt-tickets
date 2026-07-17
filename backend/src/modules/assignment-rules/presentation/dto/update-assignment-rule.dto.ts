import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateAssignmentRuleDto {
  @ApiProperty()
  @IsUUID()
  agentId: string;
}
