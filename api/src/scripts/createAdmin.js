const path = require('path');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createAdmin = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ DATABASE_URL is not set in .env');
      process.exit(1);
    }
    console.log('Connecting to PostgreSQL (nntmdb)...');
    console.log('Host: ' + (dbUrl.match(/@([^/]+)\//) || [])[1] || '***');

    await prisma.$connect();

    const email = 'admin@nntm.vn';
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('Admin user already exists:', email);
      await prisma.$disconnect();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password: 123456');
    console.log('Role: ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.message && error.message.includes('connect')) {
      console.error('\n💡 Ensure PostgreSQL is reachable and DATABASE_URL in .env is correct.');
      console.error('   Example: postgresql://user:pass@host:port/nntmdb\n');
    }
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
};

createAdmin();
