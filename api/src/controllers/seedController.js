const { prisma } = require('../config/database');

// @desc    Get all seed varieties
// @route   GET /api/seeds
// @access  Public
exports.getSeeds = async (req, res) => {
  try {
    const { cropId, isActive } = req.query;
    const where = {};
    
    if (cropId) where.cropId = cropId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const seeds = await prisma.seedVariety.findMany({
      where,
      include: {
        crop: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: seeds.length,
      data: seeds,
    });
  } catch (error) {
    console.error('Get seeds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single seed variety
// @route   GET /api/seeds/:id
// @access  Public
exports.getSeed = async (req, res) => {
  try {
    const seed = await prisma.seedVariety.findUnique({
      where: { id: req.params.id },
      include: {
        crop: true,
      },
    });

    if (!seed) {
      return res.status(404).json({
        success: false,
        message: 'Seed variety not found',
      });
    }

    res.status(200).json({
      success: true,
      data: seed,
    });
  } catch (error) {
    console.error('Get seed error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create seed variety (Admin only)
// @route   POST /api/seeds
// @access  Private (Admin)
exports.createSeed = async (req, res) => {
  try {
    const seed = await prisma.seedVariety.create({
      data: req.body,
      include: {
        crop: true,
      },
    });

    res.status(201).json({
      success: true,
      data: seed,
    });
  } catch (error) {
    console.error('Create seed error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update seed variety
// @route   PUT /api/seeds/:id
// @access  Private (Admin)
exports.updateSeed = async (req, res) => {
  try {
    const seed = await prisma.seedVariety.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        crop: true,
      },
    });

    res.status(200).json({
      success: true,
      data: seed,
    });
  } catch (error) {
    console.error('Update seed error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Seed variety not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete seed variety
// @route   DELETE /api/seeds/:id
// @access  Private (Admin)
exports.deleteSeed = async (req, res) => {
  try {
    await prisma.seedVariety.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Delete seed error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Seed variety not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
