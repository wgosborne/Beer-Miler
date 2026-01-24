const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const adminPassword = await bcryptjs.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@beer-mile.test' },
      update: {},
      create: {
        email: 'admin@beer-mile.test',
        username: 'admin',
        passwordHash: adminPassword,
        role: 'admin',
      },
    });

    // Create initial event
    const event = await prisma.event.upsert({
      where: { id: 'event-1' },
      update: {},
      create: {
        id: 'event-1',
        name: "Annie's Beer Mile",
        status: 'scheduled',
      },
    });

    console.log('Seed completed successfully');
    console.log('Admin user:', admin.email);
    console.log('Event:', event.name);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
