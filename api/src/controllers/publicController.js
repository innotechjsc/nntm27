const { prisma } = require('../config/database');

// @desc    Get public plots for landing (no auth)
// @route   GET /api/public/plots
// @access  Public
exports.getPublicPlots = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const plots = await prisma.plot.findMany({
      where: { status: { in: ['ACTIVE', 'FALLOW'] } },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            address: true,
          },
        },
        seasons: {
          where: { status: { in: ['GROWING', 'HARVESTING', 'PLANTED'] } },
          take: 1,
          include: { crop: { select: { name: true } } },
        },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    // Add mock humidity/growth for demo (from seasons or random)
    const result = plots.map((p) => {
      const season = p.seasons?.[0];
      const humidity = 65 + Math.floor(Math.random() * 20);
      const growth = season ? (season.status === 'HARVESTING' ? 90 : 70 + Math.floor(Math.random() * 25)) : 75;
      return {
        id: p.id,
        name: p.name,
        cropType: p.cropType || season?.crop?.name,
        status: p.status,
        area: p.area,
        farm: p.farm,
        humidity,
        growth,
        description: p.cropType
          ? `Vùng trồng ${p.cropType} chất lượng cao`
          : `Vùng trồng ${p.name} – ${p.farm?.name || ''}`,
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get public plots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public stats for landing (no auth)
// @route   GET /api/public/stats
// @access  Public
exports.getPublicStats = async (req, res) => {
  try {
    const [
      plotsCount,
      harvestsCount,
      ordersCount,
      farmsCount,
      activeSeasonsCount,
      productsCount,
      harvests,
      orders,
    ] = await Promise.all([
      prisma.plot.count({ where: { status: 'ACTIVE' } }),
      prisma.harvest.count(),
      prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
      prisma.farm.count({ where: { status: 'ACTIVE' } }),
      prisma.season.count({
        where: { status: { in: ['PLANTED', 'GROWING', 'HARVESTING'] } },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.harvest.findMany({
        take: 5,
        orderBy: { harvestDate: 'desc' },
        include: {
          plot: { include: { farm: { select: { name: true } } } },
          season: { include: { crop: { select: { name: true } } } },
        },
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalRevenue = orders._sum?.totalAmount || 0;

    const harvestHistory = harvests.map((h) => ({
      id: h.id,
      date: h.harvestDate,
      title: `Thu hoạch ${h.season?.crop?.name || h.plot?.name || 'Nông sản'}`,
      description: `${h.quantity} ${h.unit} – ${h.plot?.farm?.name || ''}`,
    }));

    res.status(200).json({
      success: true,
      data: {
        plotsCount,
        harvestsCount,
        ordersCount,
        farmsCount,
        activeSeasonsCount,
        productsCount,
        totalRevenue,
        harvestHistory,
      },
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured farms for landing (no auth)
// @route   GET /api/public/featured-farms
// @access  Public
exports.getFeaturedFarms = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const farms = await prisma.farm.findMany({
      where: { status: 'ACTIVE' },
      include: {
        region: { select: { id: true, name: true, type: true } },
        _count: { select: { plots: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    const result = farms.map((f) => ({
      id: f.id,
      name: f.name,
      address: f.address,
      latitude: f.latitude,
      longitude: f.longitude,
      totalArea: f.totalArea,
      certification: f.certification || [],
      region: f.region,
      plotsCount: f._count.plots,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get featured farms error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public products for landing (no auth)
// @route   GET /api/public/products
// @access  Public
exports.getPublicProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        unit: true,
        price: true,
        weight: true,
        images: true,
        certifications: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Get public products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get regions summary for landing (no auth) – tỉnh có trang trại
// @route   GET /api/public/regions-summary
// @access  Public
exports.getRegionsSummary = async (req, res) => {
  try {
    const provinces = await prisma.region.findMany({
      where: { type: 'PROVINCE', farms: { some: {} } },
      select: {
        id: true,
        name: true,
        code: true,
        _count: { select: { farms: true } },
      },
      orderBy: { name: 'asc' },
    });

    const result = {
      provincesCount: provinces.length,
      provinces: provinces.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        farmsCount: p._count.farms,
      })),
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get regions summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
