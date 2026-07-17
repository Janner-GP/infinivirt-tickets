-- ============================================================================
-- queries.sql — Consultas SQL requeridas por el enunciado de la prueba técnica
-- ============================================================================
-- Convenciones (ver docs/logica-negocio-trade-offs.md § Convenciones de nombres):
--   - Nombres de tabla: snake_case con prefijo de 3 letras por módulo
--     (usr_users, cli_clients, cat_categories, cat_subcategories, tkt_*).
--   - Nombres de columna: camelCase tal cual el modelo Prisma, por eso van
--     entre comillas dobles en todas las consultas (Postgres es case-sensitive
--     con identificadores entrecomillados).
--
-- Supuestos donde el enunciado era ambiguo (documentados explícitamente):
--   (4) "usuario con más tickets resueltos" se calcula sobre tkt_status_history
--       (quién ejecutó la transición a RESOLVED), no sobre assignedToId actual,
--       porque el ticket puede haber sido reasignado después de resolverse.
--   (6) "tickets abiertos" se interpreta como status = 'OPEN' en sentido
--       estricto (no "no cerrados"), ya que el enunciado usa ese mismo término
--       para el estado explícito del ticket.
--   (7) "reasignado" cuenta filas en tkt_assignment_history, que solo registra
--       reasignaciones explícitas vía PATCH /tickets/:id/assign — la
--       auto-asignación inicial al crear el ticket (por Agente o por regla de
--       categoría) no genera una fila ahí, porque no es una "reasignación".
-- ============================================================================


-- 1) Cantidad de tickets por estado para cada cliente.
SELECT
  c.id            AS "clientId",
  c.name          AS "clientName",
  t.status,
  COUNT(*)        AS "ticketCount"
FROM tkt_tickets t
JOIN cli_clients c ON c.id = t."clientId"
GROUP BY c.id, c.name, t.status
ORDER BY c.name, t.status;


-- 2) Los cinco clientes con mayor cantidad de tickets de prioridad alta o crítica.
SELECT
  c.id                    AS "clientId",
  c.name                  AS "clientName",
  COUNT(*)                AS "highOrCriticalCount"
FROM tkt_tickets t
JOIN cli_clients c ON c.id = t."clientId"
WHERE t.priority IN ('HIGH', 'CRITICAL')
GROUP BY c.id, c.name
ORDER BY "highOrCriticalCount" DESC
LIMIT 5;


-- 3) Tickets que llevan más de 48 horas sin actualización y que no están cerrados.
SELECT
  t.id,
  t.title,
  t.status,
  t.priority,
  t."updatedAt",
  ROUND(EXTRACT(EPOCH FROM (NOW() - t."updatedAt")) / 3600, 1) AS "hoursSinceUpdate"
FROM tkt_tickets t
WHERE t.status <> 'CLOSED'
  AND t."updatedAt" < NOW() - INTERVAL '48 hours'
ORDER BY t."updatedAt" ASC;


-- 4) Usuario con mayor cantidad de tickets resueltos durante el último mes.
--    (ver nota de supuestos arriba: se toma de tkt_status_history, no de assignedToId)
SELECT
  u.id            AS "userId",
  u.name          AS "userName",
  COUNT(*)        AS "resolvedCount"
FROM tkt_status_history h
JOIN usr_users u ON u.id = h."changedById"
WHERE h."newStatus" = 'RESOLVED'
  AND h."createdAt" >= NOW() - INTERVAL '1 month'
GROUP BY u.id, u.name
ORDER BY "resolvedCount" DESC
LIMIT 1;


-- 5) Tiempo promedio de resolución de tickets por prioridad.
--    Solo considera tickets que actualmente tienen resolvedAt (fueron resueltos
--    y no se reabrieron después; al reabrir, resolvedAt se limpia — ver ADR de
--    máquina de estados en docs/logica-negocio-trade-offs.md).
SELECT
  priority,
  ROUND(AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600), 1) AS "avgResolutionHours",
  COUNT(*) AS "resolvedTicketCount"
FROM tkt_tickets
WHERE "resolvedAt" IS NOT NULL
GROUP BY priority
ORDER BY priority;


-- 6) Cantidad de tickets abiertos (status = 'OPEN') por agente.
--    LEFT JOIN para que un agente sin tickets abiertos aparezca con 0, no se omita.
SELECT
  u.id            AS "agentId",
  u.name          AS "agentName",
  COUNT(t.id)     AS "openTicketCount"
FROM usr_users u
LEFT JOIN tkt_tickets t
  ON t."assignedToId" = u.id
  AND t.status = 'OPEN'
WHERE u.role = 'AGENT'
GROUP BY u.id, u.name
ORDER BY "openTicketCount" DESC;


-- 7) Tickets que han sido reasignados más de dos veces.
SELECT
  t.id            AS "ticketId",
  t.title,
  COUNT(h.id)     AS "reassignmentCount"
FROM tkt_tickets t
JOIN tkt_assignment_history h ON h."ticketId" = t.id
GROUP BY t.id, t.title
HAVING COUNT(h.id) > 2
ORDER BY "reassignmentCount" DESC;


-- 8) Porcentaje de tickets cerrados frente al total de tickets creados en los últimos 30 días.
SELECT
  COUNT(*)                                              AS "totalCreatedLast30Days",
  COUNT(*) FILTER (WHERE status = 'CLOSED')             AS "closedCount",
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'CLOSED') / NULLIF(COUNT(*), 0),
    2
  )                                                      AS "closedPercentage"
FROM tkt_tickets
WHERE "createdAt" >= NOW() - INTERVAL '30 days';
