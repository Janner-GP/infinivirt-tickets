import { Module } from '@nestjs/common';
import { AssignmentRulesModule } from '../assignment-rules/assignment-rules.module';
import { TicketsService } from './application/tickets.service';
import { TicketRepository } from './domain/repositories/ticket.repository';
import { PrismaTicketRepository } from './infrastructure/persistence/prisma-ticket.repository';
import { TicketOwnershipGuard } from './presentation/guards/ticket-ownership.guard';
import { TicketsController } from './presentation/tickets.controller';

@Module({
  imports: [AssignmentRulesModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketOwnershipGuard,
    { provide: TicketRepository, useClass: PrismaTicketRepository },
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
