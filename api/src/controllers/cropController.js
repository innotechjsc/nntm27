const { prisma } = require('../config/database');

// @desc    Get all crops
// @route   GET /api/crops
// @access  Public
exports.getCrops = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const crops = await prisma.crop.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single crop (growthPeriod, điều kiện chăm sóc)
// @route   GET /api/crops/:id
// @access  Public
exports.getCrop = async (req, res) => {
  try {
    const crop = await prisma.crop.findUnique({
      where: { id: req.params.id },
      include: {
        seedVarieties: { where: { isActive: true }, select: { id: true, name: true, supplier: true, price: true, unit: true } },
      },
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create crop
// @route   POST /api/crops
// @access  Private (ADMIN)
exports.createCrop = async (req, res) => {
  try {
    const {
      name,
      variety,
      category,
      growthPeriod,
      temperatureMin,
      temperatureMax,
      humidityMin,
      humidityMax,
      soilType,
      waterRequirement,
      description,
      standardProcess,
      images,
      isActive,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name',
      });
    }

    const crop = await prisma.crop.create({
      data: {
        name,
        variety: variety || null,
        category: category || null,
        growthPeriod: growthPeriod != null ? parseInt(growthPeriod, 10) : null,
        temperatureMin: temperatureMin != null ? Number(temperatureMin) : null,
        temperatureMax: temperatureMax != null ? Number(temperatureMax) : null,
        humidityMin: humidityMin != null ? Number(humidityMin) : null,
        humidityMax: humidityMax != null ? Number(humidityMax) : null,
        soilType: Array.isArray(soilType) ? soilType : [],
        waterRequirement: waterRequirement || null,
        description: description || null,
        standardProcess: standardProcess || null,
        images: images && typeof images === 'object' ? images : undefined,
        isActive: isActive !== false,
      },
    });

    res.status(201).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private (ADMIN)
exports.updateCrop = async (req, res) => {
  try {
    const exists = await prisma.crop.findUnique({
      where: { id: req.params.id },
    });
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    const {
      name,
      variety,
      category,
      growthPeriod,
      temperatureMin,
      temperatureMax,
      humidityMin,
      humidityMax,
      soilType,
      waterRequirement,
      description,
      standardProcess,
      images,
      isActive,
    } = req.body;
    const data = {};
    if (name != null) data.name = name;
    if (variety !== undefined) data.variety = variety || null;
    if (category !== undefined) data.category = category || null;
    if (growthPeriod !== undefined) data.growthPeriod = growthPeriod == null ? null : parseInt(growthPeriod, 10);
    if (temperatureMin !== undefined) data.temperatureMin = temperatureMin == null ? null : Number(temperatureMin);
    if (temperatureMax !== undefined) data.temperatureMax = temperatureMax == null ? null : Number(temperatureMax);
    if (humidityMin !== undefined) data.humidityMin = humidityMin == null ? null : Number(humidityMin);
    if (humidityMax !== undefined) data.humidityMax = humidityMax == null ? null : Number(humidityMax);
    if (Array.isArray(soilType)) data.soilType = soilType;
    if (waterRequirement !== undefined) data.waterRequirement = waterRequirement || null;
    if (description !== undefined) data.description = description || null;
    if (standardProcess !== undefined) data.standardProcess = standardProcess || null;
    if (images !== undefined && typeof images === 'object') data.images = images;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const crop = await prisma.crop.update({
      where: { id: req.params.id },
      data,
    });

    res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private (ADMIN)
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await prisma.crop.findUnique({
      where: { id: req.params.id },
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    await prisma.crop.delete({
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
