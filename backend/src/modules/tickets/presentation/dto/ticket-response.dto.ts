import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TicketCommentResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  authorId: string;

  @Expose()
  @ApiProperty()
  content: string;

  @Expose()
  @ApiProperty()
  isInternal: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<TicketCommentResponseDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class TicketResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  clientId: string;

  @Expose()
  @ApiProperty()
  categoryId: string;

  @Expose()
  @ApiProperty()
  subcategoryId: string;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @Expose()
  @ApiProperty({ enum: TicketPriority })
  priority: TicketPriority;

  @Expose()
  @ApiProperty()
  createdById: string;

  @Expose()
  @ApiProperty({ nullable: true })
  assignedToId: string | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ nullable: true })
  resolvedAt: Date | null;

  @Expose()
  @ApiProperty({ nullable: true })
  closedAt: Date | null;

  @Expose()
  @ApiProperty({ type: [TicketCommentResponseDto], required: false })
  comments?: TicketCommentResponseDto[];

  constructor(partial: Partial<TicketResponseDto>) {
    Object.assign(this, partial);
  }
}
