import { TicketStatus } from '@prisma/client';

/**
 * Máquina de estados del ticket — ver docs/logica-negocio-trade-offs.md (decisión confirmada con el usuario,
 * no es una regla implícita del enunciado). Cualquier transición fuera de esta tabla
 * se rechaza con BadRequestException en TicketsService.
 */
export const TICKET_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.PENDING_CUSTOMER,
    TicketStatus.RESOLVED,
  ],
  [TicketStatus.PENDING_CUSTOMER]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
  ],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
  [TicketStatus.CLOSED]: [TicketStatus.OPEN],
};

/**
 * Transiciones reservadas a ADMIN (implican cerrar o reabrir formalmente),
 * según "Administrador puede cerrar o reabrir tickets" del enunciado.
 */
export const ADMIN_ONLY_TRANSITIONS: Array<{
  from: TicketStatus;
  to: TicketStatus;
}> = [
  { from: TicketStatus.RESOLVED, to: TicketStatus.CLOSED },
  { from: TicketStatus.CLOSED, to: TicketStatus.OPEN },
];

export function isAdminOnlyTransition(
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  return ADMIN_ONLY_TRANSITIONS.some((t) => t.from === from && t.to === to);
}
