const { prisma } = require('../config/database');

// @desc    Get all regions
// @route   GET /api/regions
// @access  Public
exports.getRegions = async (req, res) => {
  try {
    const { type, parentId } = req.query;
    const where = {};
    if (type) where.type = type;
    if (parentId !== undefined && parentId !== '') {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    const regions = await prisma.region.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true, type: true, code: true } },
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    res.status(200).json({
      success: true,
      count: regions.length,
      data: regions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single region
// @route   GET /api/regions/:id
// @access  Public
exports.getRegion = async (req, res) => {
  try {
    const region = await prisma.region.findUnique({
      where: { id: req.params.id },
      include: {
        parent: { select: { id: true, name: true, type: true, code: true } },
        children: { select: { id: true, name: true, type: true, code: true } },
      },
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found',
      });
    }

    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create region
// @route   POST /api/regions
// @access  Private (ADMIN)
exports.createRegion = async (req, res) => {
  try {
    const { name, type, code, parentId, latitude, longitude } = req.body;
    if (!name || !type || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, type, code',
      });
    }

    const region = await prisma.region.create({
      data: {
        name,
        type,
        code,
        parentId: parentId || null,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: region,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Region with this code already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update region
// @route   PUT /api/regions/:id
// @access  Private (ADMIN)
exports.updateRegion = async (req, res) => {
  try {
    const exists = await prisma.region.findUnique({
      where: { id: req.params.id },
    });
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Region not found',
      });
    }

    const { name, type, code, parentId, latitude, longitude } = req.body;
    const data = {};
    if (name != null) data.name = name;
    if (type != null) data.type = type;
    if (code != null) data.code = code;
    if (parentId !== undefined) data.parentId = parentId || null;
    if (latitude !== undefined) data.latitude = latitude == null ? null : Number(latitude);
    if (longitude !== undefined) data.longitude = longitude == null ? null : Number(longitude);

    const region = await prisma.region.update({
      where: { id: req.params.id },
      data,
    });

    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Region with this code already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete region
// @route   DELETE /api/regions/:id
// @access  Private (ADMIN)
exports.deleteRegion = async (req, res) => {
  try {
    const region = await prisma.region.findUnique({
      where: { id: req.params.id },
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found',
      });
    }

    const childCount = await prisma.region.count({
      where: { parentId: req.params.id },
    });
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete region with child regions',
      });
    }

    await prisma.region.delete({
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
