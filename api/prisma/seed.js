const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.region.count();
  if (count > 0) {
    console.log('Regions already exist, skip seed.');
    return;
  }
  await prisma.region.createMany({
    data: [
      { name: 'Hà Nội', type: 'PROVINCE', code: 'HN' },
      { name: 'Hồ Chí Minh', type: 'PROVINCE', code: 'HCM' },
      { name: 'Đà Nẵng', type: 'PROVINCE', code: 'DN' },
    ],
  });
  console.log('Seeded default regions.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
