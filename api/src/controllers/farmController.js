const { prisma } = require('../config/database');

// @desc    Get all farms
// @route   GET /api/farms
// @access  Public
exports.getFarms = async (req, res) => {
  try {
    const { ownerId, regionId, status } = req.query;
    const where = {};
    if (ownerId) where.ownerId = ownerId;
    if (regionId) where.regionId = regionId;
    if (status) where.status = status;

    const farms = await prisma.farm.findMany({
      where,
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        region: { select: { id: true, name: true, type: true, code: true } },
        plots: { select: { id: true, name: true, area: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: farms.length,
      data: farms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single farm
// @route   GET /api/farms/:id
// @access  Public
exports.getFarm = async (req, res) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, fullName: true, email: true, phone: true } },
        region: { select: { id: true, name: true, type: true, code: true } },
        plots: {
          include: {
            seasons: { select: { id: true, name: true, status: true, startDate: true } },
          },
        },
      },
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    res.status(200).json({
      success: true,
      data: farm,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new farm (trang trại / dự án)
// @route   POST /api/farms
// @access  Private (FARMER, ADMIN)
exports.createFarm = async (req, res) => {
  try {
    const { name, regionId, address, latitude, longitude, totalArea, description, certification, status } = req.body;
    const ownerId = req.user.id;

    if (!name || !regionId || !address || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, regionId, address, latitude, longitude',
      });
    }

    const region = await prisma.region.findUnique({ where: { id: regionId } });
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region not found' });
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        ownerId,
        regionId,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        totalArea: totalArea != null ? Number(totalArea) : 0,
        description: description || null,
        certification: Array.isArray(certification) ? certification : [],
        status: status || 'PENDING',
      },
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        region: { select: { id: true, name: true, type: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: farm,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update farm
// @route   PUT /api/farms/:id
// @access  Private (Owner, ADMIN)
exports.updateFarm = async (req, res) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: req.params.id },
      select: { id: true, ownerId: true },
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    if (farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this farm',
      });
    }

    const { name, regionId, address, latitude, longitude, totalArea, description, certification, status } = req.body;
    const data = {};
    if (name != null) data.name = name;
    if (regionId != null) data.regionId = regionId;
    if (address != null) data.address = address;
    if (latitude != null) data.latitude = Number(latitude);
    if (longitude != null) data.longitude = Number(longitude);
    if (totalArea != null) data.totalArea = Number(totalArea);
    if (description != null) data.description = description;
    if (Array.isArray(certification)) data.certification = certification;
    if (status != null) data.status = status;

    const updated = await prisma.farm.update({
      where: { id: req.params.id },
      data,
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        region: { select: { id: true, name: true, type: true } },
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

// @desc    Delete farm
// @route   DELETE /api/farms/:id
// @access  Private (Owner, ADMIN)
exports.deleteFarm = async (req, res) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: req.params.id },
      select: { id: true, ownerId: true },
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found',
      });
    }

    if (farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this farm',
      });
    }

    await prisma.farm.delete({
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
