const { prisma } = require('../config/database');

// @desc    Get all seasons
// @route   GET /api/seasons
// @access  Public
exports.getSeasons = async (req, res) => {
  try {
    const { plotId, status } = req.query;
    const where = {};
    if (plotId) where.plotId = plotId;
    if (status) where.status = status;

    const seasons = await prisma.season.findMany({
      where,
      include: {
        plot: { include: { farm: { select: { id: true, name: true } } } },
        crop: { select: { id: true, name: true, growthPeriod: true, category: true } },
        seedVariety: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: seasons.length,
      data: seasons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get growth progress for a season (D2 - tiến độ sinh trưởng)
// @route   GET /api/seasons/:id/growth-progress
// @access  Public
exports.getSeasonGrowthProgress = async (req, res) => {
  try {
    const season = await prisma.season.findUnique({
      where: { id: req.params.id },
      include: { crop: { select: { growthPeriod: true, name: true } } },
    });

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found',
      });
    }

    const now = new Date();
    const start = new Date(season.startDate);
    let end = season.expectedHarvestDate ? new Date(season.expectedHarvestDate) : null;

    if (!end && season.crop?.growthPeriod) {
      end = new Date(start);
      end.setDate(end.getDate() + season.crop.growthPeriod);
    }

    let progressPercent = 0;
    let daysElapsed = 0;
    let totalDays = 0;
    let daysRemaining = null;

    if (end && end > start) {
      totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      daysElapsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
      progressPercent = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
    }

    res.status(200).json({
      success: true,
      data: {
        seasonId: season.id,
        progressPercent: Math.round(progressPercent * 10) / 10,
        daysElapsed,
        totalDays,
        daysRemaining,
        startDate: season.startDate,
        expectedHarvestDate: season.expectedHarvestDate,
        status: season.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single season
// @route   GET /api/seasons/:id
// @access  Public
exports.getSeason = async (req, res) => {
  try {
    const season = await prisma.season.findUnique({
      where: { id: req.params.id },
      include: {
        plot: {
          include: {
            farm: { select: { id: true, name: true, ownerId: true } },
          },
        },
        crop: true,
        seedVariety: true,
        tasks: { orderBy: { scheduledDate: 'asc' } },
        harvests: true,
      },
    });

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found',
      });
    }

    res.status(200).json({
      success: true,
      data: season,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new season (mùa vụ)
// @route   POST /api/seasons
// @access  Private (FARMER, ADMIN)
exports.createSeason = async (req, res) => {
  try {
    const {
      plotId,
      cropId,
      seedVarietyId,
      name,
      startDate,
      expectedHarvestDate,
      expectedYield,
      standard,
    } = req.body;

    if (!plotId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide plotId and startDate',
      });
    }

    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      include: { farm: { select: { ownerId: true } } },
    });
    if (!plot) {
      return res.status(404).json({ success: false, message: 'Plot not found' });
    }

    if (plot.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create season for this plot',
      });
    }

    const season = await prisma.season.create({
      data: {
        plotId,
        cropId: cropId || null,
        seedVarietyId: seedVarietyId || null,
        name: name || null,
        startDate: new Date(startDate),
        expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
        expectedYield: expectedYield != null ? Number(expectedYield) : null,
        standard: standard || null,
        status: 'PLANNED',
      },
      include: {
        plot: { select: { id: true, name: true, farm: { select: { name: true } } } },
        crop: { select: { id: true, name: true } },
        seedVariety: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: season,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update season (quản lý mùa vụ)
// @route   PUT /api/seasons/:id
// @access  Private
exports.updateSeason = async (req, res) => {
  try {
    const season = await prisma.season.findUnique({
      where: { id: req.params.id },
      include: { plot: { include: { farm: { select: { ownerId: true } } } } },
    });

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found',
      });
    }

    if (season.plot.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this season',
      });
    }

    const {
      cropId,
      seedVarietyId,
      name,
      startDate,
      expectedHarvestDate,
      actualHarvestDate,
      expectedYield,
      actualYield,
      status,
      standard,
    } = req.body;
    const data = {};
    if (cropId !== undefined) data.cropId = cropId || null;
    if (seedVarietyId !== undefined) data.seedVarietyId = seedVarietyId || null;
    if (name !== undefined) data.name = name || null;
    if (startDate != null) data.startDate = new Date(startDate);
    if (expectedHarvestDate !== undefined) data.expectedHarvestDate = expectedHarvestDate ? new Date(expectedHarvestDate) : null;
    if (actualHarvestDate !== undefined) data.actualHarvestDate = actualHarvestDate ? new Date(actualHarvestDate) : null;
    if (expectedYield !== undefined) data.expectedYield = expectedYield == null ? null : Number(expectedYield);
    if (actualYield !== undefined) data.actualYield = actualYield == null ? null : Number(actualYield);
    if (status != null) data.status = status;
    if (standard !== undefined) data.standard = standard || null;

    const updated = await prisma.season.update({
      where: { id: req.params.id },
      data,
      include: {
        plot: { select: { id: true, name: true } },
        crop: { select: { id: true, name: true } },
        seedVariety: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete season
// @route   DELETE /api/seasons/:id
// @access  Private
exports.deleteSeason = async (req, res) => {
  try {
    const season = await prisma.season.findUnique({
      where: { id: req.params.id },
      include: { plot: { include: { farm: { select: { ownerId: true } } } } },
    });

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found',
      });
    }

    if (season.plot.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this season',
      });
    }

    await prisma.season.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
