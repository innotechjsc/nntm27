const { prisma } = require('../config/database');

const calculateArea = (coordinates) => {
  if (!coordinates || !coordinates[0] || coordinates[0].length < 3) return 0;
  let area = 0;
  const coords = coordinates[0];
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }
  area = Math.abs(area) / 2;
  return area * 111000 * 111000;
};

const validatePolygon = (geometry) => {
  if (!geometry || geometry.type !== 'Polygon') {
    return { valid: false, message: 'Geometry must be a Polygon' };
  }
  if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
    return { valid: false, message: 'Invalid coordinates format' };
  }
  if (geometry.coordinates.length === 0 || !geometry.coordinates[0]) {
    return { valid: false, message: 'Polygon must have at least one ring' };
  }
  const ring = geometry.coordinates[0];
  if (ring.length < 3) {
    return { valid: false, message: 'Polygon must have at least 3 points' };
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return { valid: false, message: 'Polygon must be closed' };
  }
  const area = calculateArea(geometry.coordinates);
  if (area < 100) {
    return { valid: false, message: 'Polygon area must be at least 100 square meters' };
  }
  return { valid: true, area };
};

// @desc    Get all plots
// @route   GET /api/plots
// @access  Public
exports.getPlots = async (req, res) => {
  try {
    const { farmId, status } = req.query;
    const where = {};
    if (farmId) where.farmId = farmId;
    if (status) where.status = status;

    const plots = await prisma.plot.findMany({
      where,
      include: {
        farm: { select: { id: true, name: true, ownerId: true, address: true } },
        seasons: { select: { id: true, name: true, status: true, startDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: plots.length,
      data: plots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single plot
// @route   GET /api/plots/:id
// @access  Public
exports.getPlot = async (req, res) => {
  try {
    const plot = await prisma.plot.findUnique({
      where: { id: req.params.id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        seasons: true,
      },
    });

    if (!plot) {
      return res.status(404).json({
        success: false,
        message: 'Plot not found',
      });
    }

    res.status(200).json({
      success: true,
      data: plot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new plot
// @route   POST /api/plots
// @access  Private (FARMER, ADMIN)
exports.createPlot = async (req, res) => {
  try {
    const { farmId, geometry, name, cropType, soilType, waterSource } = req.body;
    const fid = farmId || req.body.farm;

    const farm = await prisma.farm.findUnique({
      where: { id: fid },
      select: { id: true, ownerId: true },
    });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    if (farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create plot for this farm',
      });
    }

    const geom = geometry || req.body.geometry;
    const validation = validatePolygon(geom);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const plot = await prisma.plot.create({
      data: {
        farmId: farm.id,
        geometry: geom,
        name: name || `Plot ${Date.now()}`,
        area: validation.area,
        cropType: cropType || null,
        soilType: soilType || null,
        waterSource: waterSource || null,
      },
      include: {
        farm: { select: { id: true, name: true, ownerId: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: plot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update plot
// @route   PUT /api/plots/:id
// @access  Private (Farm Owner, ADMIN)
exports.updatePlot = async (req, res) => {
  try {
    const plot = await prisma.plot.findUnique({
      where: { id: req.params.id },
      include: { farm: { select: { ownerId: true } } },
    });

    if (!plot) {
      return res.status(404).json({
        success: false,
        message: 'Plot not found',
      });
    }

    if (plot.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this plot',
      });
    }

    const { geometry, name, cropType, soilType, waterSource, status } = req.body;
    const data = {};
    if (name != null) data.name = name;
    if (cropType != null) data.cropType = cropType;
    if (soilType != null) data.soilType = soilType;
    if (waterSource != null) data.waterSource = waterSource;
    if (status != null) data.status = status;

    if (geometry) {
      const validation = validatePolygon(geometry);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }
      data.geometry = geometry;
      data.area = validation.area;
    }

    const updated = await prisma.plot.update({
      where: { id: req.params.id },
      data,
      include: {
        farm: { select: { id: true, name: true, ownerId: true } },
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

// @desc    Delete plot
// @route   DELETE /api/plots/:id
// @access  Private (Farm Owner, ADMIN)
exports.deletePlot = async (req, res) => {
  try {
    const plot = await prisma.plot.findUnique({
      where: { id: req.params.id },
      include: { farm: { select: { ownerId: true } } },
    });

    if (!plot) {
      return res.status(404).json({
        success: false,
        message: 'Plot not found',
      });
    }

    if (plot.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this plot',
      });
    }

    await prisma.plot.delete({
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
