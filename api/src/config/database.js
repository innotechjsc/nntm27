const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

const connectDB = async () => {
  try {
    console.log('Connecting to PostgreSQL database...');
    await prisma.$connect();
    console.log('✅ PostgreSQL Connected successfully');
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
