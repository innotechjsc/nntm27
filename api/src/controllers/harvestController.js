const { prisma } = require('../config/database');

// @desc    Get all harvests
// @route   GET /api/harvests
// @access  Private
exports.getHarvests = async (req, res) => {
  try {
    const { plotId, seasonId, status } = req.query;
    const where = {};
    
    if (plotId) where.plotId = plotId;
    if (seasonId) where.seasonId = seasonId;
    if (status) where.status = status;

    const harvests = await prisma.harvest.findMany({
      where,
      include: {
        plot: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                owner: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
        season: {
          select: {
            id: true,
            name: true,
            cropId: true,
          },
        },
        processingBatches: true,
      },
      orderBy: { harvestDate: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: harvests.length,
      data: harvests,
    });
  } catch (error) {
    console.error('Get harvests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Export harvests as CSV
// @route   GET /api/harvests/export
// @access  Private
exports.exportHarvests = async (req, res) => {
  try {
    const { plotId, seasonId, status } = req.query;
    const where = {};
    if (plotId) where.plotId = plotId;
    if (seasonId) where.seasonId = seasonId;
    if (status) where.status = status;

    const harvests = await prisma.harvest.findMany({
      where,
      include: {
        plot: { include: { farm: { select: { name: true } } } },
        season: { include: { crop: { select: { name: true } } } },
      },
      orderBy: { harvestDate: 'desc' },
    });

    const headers = ['Ngày', 'Lô', 'Trang trại', 'Cây trồng', 'Số lượng (kg)', 'Đơn vị', 'Chất lượng', 'Trạng thái'];
    const rows = harvests.map((h) => [
      h.harvestDate ? new Date(h.harvestDate).toLocaleDateString('vi-VN') : '',
      h.plot?.name || '',
      h.plot?.farm?.name || '',
      h.season?.crop?.name || '',
      h.quantity ?? '',
      h.unit || 'kg',
      h.qualityGrade || '',
      h.status || '',
    ]);

    const escape = (v) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const bom = '\ufeff';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=harvests-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(bom + csv);
  } catch (error) {
    console.error('Export harvests error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single harvest
// @route   GET /api/harvests/:id
// @access  Private
exports.getHarvest = async (req, res) => {
  try {
    const harvest = await prisma.harvest.findUnique({
      where: { id: req.params.id },
      include: {
        plot: {
          include: {
            farm: true,
          },
        },
        season: true,
        processingBatches: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!harvest) {
      return res.status(404).json({
        success: false,
        message: 'Harvest not found',
      });
    }

    res.status(200).json({
      success: true,
      data: harvest,
    });
  } catch (error) {
    console.error('Get harvest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create harvest (Thu hoạch)
// @route   POST /api/harvests
// @access  Private (Farmer)
exports.createHarvest = async (req, res) => {
  try {
    const { plotId, seasonId, harvestDate, quantity, qualityGrade, unit, notes, images, storageLocation } = req.body;

    if (!plotId || !harvestDate || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Plot ID, harvest date, and quantity are required',
      });
    }

    // Verify plot exists and user has access
    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      include: {
        farm: true,
      },
    });

    if (!plot) {
      return res.status(404).json({
        success: false,
        message: 'Plot not found',
      });
    }

    if (req.user.role !== 'ADMIN' && plot.farm.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create harvest for this plot',
      });
    }

    const harvest = await prisma.harvest.create({
      data: {
        plotId,
        seasonId,
        harvestDate: new Date(harvestDate),
        quantity,
        qualityGrade,
        unit: unit || 'kg',
        notes,
        images: images || [],
        storageLocation,
      },
      include: {
        plot: {
          include: {
            farm: true,
          },
        },
        season: true,
      },
    });

    res.status(201).json({
      success: true,
      data: harvest,
    });
  } catch (error) {
    console.error('Create harvest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update harvest
// @route   PUT /api/harvests/:id
// @access  Private (Farmer, Admin)
exports.updateHarvest = async (req, res) => {
  try {
    const harvest = await prisma.harvest.findUnique({
      where: { id: req.params.id },
      include: {
        plot: {
          include: {
            farm: true,
          },
        },
      },
    });

    if (!harvest) {
      return res.status(404).json({
        success: false,
        message: 'Harvest not found',
      });
    }

    // Authorization check
    if (req.user.role !== 'ADMIN' && harvest.plot.farm.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this harvest',
      });
    }

    const updatedHarvest = await prisma.harvest.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        plot: {
          include: {
            farm: true,
          },
        },
        season: true,
        processingBatches: true,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedHarvest,
    });
  } catch (error) {
    console.error('Update harvest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
