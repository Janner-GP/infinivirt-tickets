import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, TicketPriority, TicketStatus } from '@prisma/client';
import type { Client } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SEED_PASSWORD = 'Sup3r$ecret!';

const CATEGORY_TREE: Record<string, string[]> = {
  'Accesos y credenciales': ['Contraseñas', 'VPN', 'Permisos de sistema'],
  Hardware: ['Impresoras', 'Equipos de cómputo', 'Periféricos'],
  Software: ['Licencias', 'Instalación', 'Errores de aplicación'],
  Facturación: ['Cobros', 'Facturas', 'Reembolsos'],
  Cuenta: ['Datos', 'Cierre de cuenta'],
};

const CLIENTS = [
  { name: 'Acme Corp', email: 'contacto@acme.test', company: 'Acme Corp', phone: '+57 300 100 2000' },
  { name: 'Northwind SAS', email: 'contacto@northwind.test', company: 'Northwind SAS', phone: '+57 300 200 3000' },
  { name: 'Delta Ingeniería', email: 'contacto@delta-ing.test', company: 'Delta Ingeniería', phone: '+57 300 300 4000' },
  { name: 'Kappa Retail', email: 'contacto@kappa.test', company: 'Kappa Retail', phone: '+57 300 400 5000' },
];

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  // --- Usuarios de staff -----------------------------------------------
  const staffUsers = [
    { name: 'Admin Demo', email: 'admin@infinivirt.test', role: Role.ADMIN },
    { name: 'Agente Demo', email: 'agente@infinivirt.test', role: Role.AGENT },
    { name: 'Agente Dos', email: 'agente2@infinivirt.test', role: Role.AGENT },
    { name: 'Supervisor Demo', email: 'supervisor@infinivirt.test', role: Role.SUPERVISOR },
  ];

  for (const user of staffUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    });
  }
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@infinivirt.test' } });
  const agent1 = await prisma.user.findUniqueOrThrow({ where: { email: 'agente@infinivirt.test' } });
  const agent2 = await prisma.user.findUniqueOrThrow({ where: { email: 'agente2@infinivirt.test' } });

  // --- Clientes ----------------------------------------------------------
  const clients: Client[] = [];
  for (const clientData of CLIENTS) {
    const client = await prisma.client.upsert({
      where: { email: clientData.email },
      update: {},
      create: clientData,
    });
    clients.push(client);
  }
  const [acme, northwind, delta, kappa] = clients;

  // --- Cuenta de Cliente vinculada a Acme Corp ---------------------------
  await prisma.user.upsert({
    where: { email: 'cliente@acme.test' },
    update: {},
    create: {
      name: 'Cliente Demo (Acme Corp)',
      email: 'cliente@acme.test',
      role: Role.CLIENT,
      clientId: acme.id,
      passwordHash,
    },
  });

  // --- Categorías y subcategorías -----------------------------------------
  const subcategoryByPath = new Map<string, { id: string; categoryId: string }>();
  for (const [categoryName, subcategoryNames] of Object.entries(CATEGORY_TREE)) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });

    for (const subcategoryName of subcategoryNames) {
      const subcategory = await prisma.subcategory.upsert({
        where: { categoryId_name: { categoryId: category.id, name: subcategoryName } },
        update: {},
        create: { categoryId: category.id, name: subcategoryName },
      });
      subcategoryByPath.set(`${categoryName}/${subcategoryName}`, {
        id: subcategory.id,
        categoryId: category.id,
      });
    }
  }

  const vpn = subcategoryByPath.get('Accesos y credenciales/VPN')!;
  const cobros = subcategoryByPath.get('Facturación/Cobros')!;
  const impresoras = subcategoryByPath.get('Hardware/Impresoras')!;
  const instalacion = subcategoryByPath.get('Software/Instalación')!;
  const datosCuenta = subcategoryByPath.get('Cuenta/Datos')!;
  const equiposComputo = subcategoryByPath.get('Hardware/Equipos de cómputo')!;
  const erroresApp = subcategoryByPath.get('Software/Errores de aplicación')!;

  // --- Reglas de auto-asignación -------------------------------------------
  await prisma.assignmentRule.upsert({
    where: { subcategoryId: vpn.id },
    update: {},
    create: { subcategoryId: vpn.id, agentId: agent1.id },
  });
  await prisma.assignmentRule.upsert({
    where: { subcategoryId: cobros.id },
    update: {},
    create: { subcategoryId: cobros.id, agentId: agent2.id },
  });

  // --- Tickets de ejemplo (solo se crean si la tabla está vacía) -----------
  const ticketCount = await prisma.ticket.count();
  if (ticketCount === 0) {
    const ticket1 = await prisma.ticket.create({
      data: {
        clientId: acme.id,
        categoryId: vpn.categoryId,
        subcategoryId: vpn.id,
        title: 'No puedo conectarme a la VPN',
        description: 'Desde ayer no logro conectar la VPN corporativa desde macOS.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        createdById: admin.id,
        assignedToId: agent1.id,
      },
    });
    await prisma.ticketComment.create({
      data: { ticketId: ticket1.id, authorId: admin.id, content: '¿Hay alguna actualización sobre mi VPN?', isInternal: false },
    });
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket1.id,
        authorId: agent1.id,
        content: 'Reviso logs de Active Directory, la cuenta aparece bloqueada por intentos fallidos.',
        isInternal: true,
      },
    });

    await prisma.ticket.create({
      data: {
        clientId: northwind.id,
        categoryId: cobros.categoryId,
        subcategoryId: cobros.id,
        title: 'Facturación duplicada en último pago',
        description: 'Se cobró dos veces la misma factura en el último ciclo.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.CRITICAL,
        createdById: admin.id,
        assignedToId: agent2.id,
      },
    });

    await prisma.ticket.create({
      data: {
        clientId: delta.id,
        categoryId: impresoras.categoryId,
        subcategoryId: impresoras.id,
        title: 'Impresora piso 3 no responde',
        description: 'La impresora del piso 3 no imprime desde esta mañana.',
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.MEDIUM,
        createdById: agent1.id,
        assignedToId: agent1.id,
        resolvedAt: new Date(),
      },
    });

    await prisma.ticket.create({
      data: {
        clientId: kappa.id,
        categoryId: instalacion.categoryId,
        subcategoryId: instalacion.id,
        title: 'Instalación de licencia de diseño',
        description: 'Solicitud de instalación de licencia adicional de software de diseño.',
        status: TicketStatus.CLOSED,
        priority: TicketPriority.LOW,
        createdById: agent2.id,
        assignedToId: agent2.id,
        resolvedAt: new Date(),
        closedAt: new Date(),
      },
    });

    await prisma.ticket.create({
      data: {
        clientId: acme.id,
        categoryId: datosCuenta.categoryId,
        subcategoryId: datosCuenta.id,
        title: 'Actualización de datos de contacto',
        description: 'El cliente solicita actualizar el correo y teléfono de contacto de la cuenta.',
        status: TicketStatus.PENDING_CUSTOMER,
        priority: TicketPriority.MEDIUM,
        createdById: admin.id,
        assignedToId: agent1.id,
      },
    });

    const overdueTicket = await prisma.ticket.create({
      data: {
        clientId: northwind.id,
        categoryId: equiposComputo.categoryId,
        subcategoryId: equiposComputo.id,
        title: 'Portátil no enciende',
        description: 'El equipo asignado al usuario no enciende desde el fin de semana.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        createdById: admin.id,
        assignedToId: agent2.id,
      },
    });
    // Se retrasa manualmente createdAt/updatedAt para que este ticket aparezca
    // como "vencido" (>48h sin actualizar) en el dashboard y en queries.sql — un
    // ticket recién creado nunca podría demostrar ese caso por sí solo.
    await prisma.$executeRaw`
      UPDATE tkt_tickets
      SET "createdAt" = NOW() - INTERVAL '4 days', "updatedAt" = NOW() - INTERVAL '3 days'
      WHERE id = ${overdueTicket.id}
    `;

    await prisma.ticket.create({
      data: {
        clientId: kappa.id,
        categoryId: erroresApp.categoryId,
        subcategoryId: erroresApp.id,
        title: 'Error al generar reporte mensual',
        description: 'El módulo de reportes lanza un error al exportar a PDF.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.CRITICAL,
        createdById: admin.id,
        assignedToId: null,
      },
    });

    console.log('7 tickets de ejemplo creados (con comentarios, uno vencido y uno sin asignar).');
  } else {
    console.log(`Ya existían ${ticketCount} tickets — se omite la creación de tickets de ejemplo.`);
  }

  console.log('\nSeed completado. Credenciales de prueba (misma contraseña para todas):');
  for (const user of staffUsers) {
    console.log(`  ${user.role.padEnd(10)} ${user.email}`);
  }
  console.log(`  ${Role.CLIENT.padEnd(10)} cliente@acme.test (vinculado a Acme Corp)`);
  console.log(`  password: ${SEED_PASSWORD}`);
  console.log(`\n${clients.length} clientes, 5 categorías con subcategorías, 2 reglas de asignación.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
