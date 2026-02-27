/**
 * Seed dữ liệu demo cho landing page (plots, harvests, orders).
 * Chạy: node prisma/seedLanding.js
 * Yêu cầu: Đã có regions, admin user, ít nhất 1 farm.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const PLOT_NAMES = [
  { name: 'Lô Lúa Hữu Cơ A1', crop: 'Lúa', desc: 'Vùng trồng lúa hữu cơ chất lượng cao, áp dụng công nghệ IoT và canh tác thông minh' },
  { name: 'Vườn Rau Sạch B2', crop: 'Rau', desc: 'Vườn rau sạch đa dạng loại, sử dụng hệ thống tưới tự động và cảm biến môi trường' },
  { name: 'Vườn Cây Ăn trái C3', crop: 'Cây ăn trái', desc: 'Vườn cây ăn trái lâu năm, đang trong giai đoạn chăm sóc và phát triển' },
  { name: 'Vườn Ớt Hữu cơ D4', crop: 'Ớt', desc: 'Vườn ớt hữu cơ với hệ thống giám sát nhiệt độ và độ ẩm tự động' },
  { name: 'Vườn Rau Mầm E5', crop: 'Rau mầm', desc: 'Vườn rau mầm trong nhà kính với điều khiển khí hậu tự động' },
  { name: 'Lô Lúa Thơm F6', crop: 'Lúa', desc: 'Lô lúa thơm đặc sản, đang trong giai đoạn chín vàng, sẵn sàng thu hoạch' },
];

async function main() {
  let region = await prisma.region.findFirst();
  if (!region) {
    await prisma.region.createMany({
      data: [
        { name: 'Hà Nội', type: 'PROVINCE', code: 'HN' },
        { name: 'Hồ Chí Minh', type: 'PROVINCE', code: 'HCM' },
        { name: 'Đồng Tháp', type: 'PROVINCE', code: 'DT' },
      ],
    });
    region = await prisma.region.findFirst();
  }

  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    const hash = await bcrypt.hash('123456', 10);
    admin = await prisma.user.create({
      data: {
        email: 'admin@nntm.vn',
        password: hash,
        fullName: 'Admin NNTM',
        role: 'ADMIN',
      },
    });
  }

  let farm = await prisma.farm.findFirst();
  if (!farm) {
    farm = await prisma.farm.create({
      data: {
        name: 'Trang trại NNTM Demo',
        ownerId: admin.id,
        regionId: region.id,
        address: 'Xã Mỹ Đông, Huyện Tháp Mười, Đồng Tháp',
        latitude: 10.762622,
        longitude: 106.660172,
        totalArea: 50000,
        status: 'ACTIVE',
      },
    });
  }

  const crop = await prisma.crop.findFirst() || await prisma.crop.create({
    data: { name: 'Lúa', category: 'grain', growthPeriod: 90 },
  });

  const plotsCount = await prisma.plot.count();
  if (plotsCount < 6) {
    for (let i = 0; i < PLOT_NAMES.length; i++) {
      const p = PLOT_NAMES[i];
      const exists = await prisma.plot.findFirst({ where: { name: p.name, farmId: farm.id } });
      if (!exists) {
        await prisma.plot.create({
          data: {
            name: p.name,
            farmId: farm.id,
            geometry: { type: 'Polygon', coordinates: [[[106.66, 10.76], [106.67, 10.76], [106.67, 10.77], [106.66, 10.77], [106.66, 10.76]]] },
            area: 5000 + i * 500,
            cropType: p.crop,
            status: 'ACTIVE',
          },
        });
      }
    }
  }

  const plotIds = (await prisma.plot.findMany({ take: 6 })).map((p) => p.id);
  const seasonsCount = await prisma.season.count();
  if (seasonsCount < 6 && plotIds.length > 0) {
    const now = new Date();
    for (let i = 0; i < Math.min(6, plotIds.length); i++) {
      const hasSeason = await prisma.season.findFirst({ where: { plotId: plotIds[i] } });
      if (hasSeason) continue;
      const start = new Date(now);
      start.setMonth(start.getMonth() - 2 - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 90);
      await prisma.season.create({
        data: {
          plotId: plotIds[i],
          cropId: crop.id,
          startDate: start,
          expectedHarvestDate: end,
          status: i < 4 ? 'GROWING' : i < 5 ? 'HARVESTING' : 'HARVESTED',
        },
      });
    }
  }

  const harvestsCount = await prisma.harvest.count();
  if (harvestsCount < 10) {
    const seasons = await prisma.season.findMany({ take: 6, include: { plot: true } });
    const months = ['Tháng 12/2024', 'Tháng 11/2024', 'Tháng 10/2024', 'Tháng 9/2024', 'Tháng 8/2024'];
    for (let i = 0; i < Math.min(5, seasons.length); i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i - 1);
      const hasHarvest = await prisma.harvest.findFirst({ where: { seasonId: seasons[i].id } });
      if (hasHarvest) continue;
      await prisma.harvest.create({
        data: {
          plotId: seasons[i].plotId,
          seasonId: seasons[i].id,
          harvestDate: d,
          quantity: 10 + i * 5,
          unit: 'kg',
          qualityGrade: 'A',
          status: 'PROCESSED',
        },
      });
    }
  }

  const product = await prisma.product.findFirst() || await prisma.product.create({
    data: { name: 'Gạo hữu cơ', category: 'processed_food', sku: 'RICE-001', price: 50000, unit: 'kg' },
  });

  const ordersCount = await prisma.order.count();
  if (ordersCount < 5) {
    const orderNums = ['ORD-2024-001', 'ORD-2024-002', 'ORD-2024-003', 'ORD-2024-004', 'ORD-2024-005'];
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.order.findFirst({ where: { orderNumber: orderNums[i] } });
      if (exists) continue;
      const amt = 5000000 + (i + 1) * 1000000;
      await prisma.order.create({
        data: {
          orderNumber: orderNums[i],
          customerName: `Khách hàng ${i + 1}`,
          customerPhone: '0900000000',
          shippingAddress: 'HCM',
          totalAmount: amt,
          status: 'DELIVERED',
          paymentStatus: 'PAID',
          items: {
            create: [{ productId: product.id, quantity: 100, unitPrice: amt / 100, totalPrice: amt }],
          },
        },
      });
    }
  }

  console.log('Landing seed done. Plots:', await prisma.plot.count(), 'Harvests:', await prisma.harvest.count(), 'Orders:', await prisma.order.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
