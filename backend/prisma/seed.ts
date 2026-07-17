import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
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

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const staffUsers = [
    { name: 'Admin Demo', email: 'admin@infinivirt.test', role: Role.ADMIN },
    { name: 'Agente Demo', email: 'agente@infinivirt.test', role: Role.AGENT },
    { name: 'Supervisor Demo', email: 'supervisor@infinivirt.test', role: Role.SUPERVISOR },
  ];

  for (const user of staffUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    });
  }
  const agent = await prisma.user.findUniqueOrThrow({ where: { email: 'agente@infinivirt.test' } });

  const client = await prisma.client.upsert({
    where: { email: 'contacto@acme.test' },
    update: {},
    create: { name: 'Acme Corp', email: 'contacto@acme.test', company: 'Acme Corp' },
  });

  await prisma.user.upsert({
    where: { email: 'cliente@acme.test' },
    update: {},
    create: {
      name: 'Cliente Demo (Acme Corp)',
      email: 'cliente@acme.test',
      role: Role.CLIENT,
      clientId: client.id,
      passwordHash,
    },
  });

  let vpnSubcategoryId: string | null = null;
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
      if (categoryName === 'Accesos y credenciales' && subcategoryName === 'VPN') {
        vpnSubcategoryId = subcategory.id;
      }
    }
  }

  if (vpnSubcategoryId) {
    await prisma.assignmentRule.upsert({
      where: { subcategoryId: vpnSubcategoryId },
      update: {},
      create: { subcategoryId: vpnSubcategoryId, agentId: agent.id },
    });
  }

  console.log('Seed completado. Credenciales de prueba (misma contraseña para las 4):');
  for (const user of staffUsers) {
    console.log(`  ${user.role.padEnd(10)} ${user.email}`);
  }
  console.log(`  ${Role.CLIENT.padEnd(10)} cliente@acme.test (vinculado a Acme Corp)`);
  console.log(`  password: ${SEED_PASSWORD}`);
  console.log('5 categorías con subcategorías creadas. Regla de asignación: VPN → Agente Demo.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
