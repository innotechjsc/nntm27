const { prisma } = require('../config/database');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const { farmId, productId, status } = req.query;
    const where = {};
    
    if (farmId) where.farmId = farmId;
    if (productId) where.productId = productId;
    if (status) where.status = status;

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
        product: true,
        processingBatch: {
          include: {
            harvest: {
              include: {
                plot: {
                  include: {
                    farm: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id: req.params.id },
      include: {
        farm: true,
        product: true,
        processingBatch: {
          include: {
            harvest: {
              include: {
                plot: { include: { farm: true } },
                season: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get inventory summary by product
// @route   GET /api/inventory/summary
// @access  Private
exports.getInventorySummary = async (req, res) => {
  try {
    const { productId } = req.query;

    const inventory = await prisma.inventory.groupBy({
      by: ['productId', 'status'],
      where: {
        productId: productId || undefined,
        status: {
          in: ['AVAILABLE', 'RESERVED'],
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Group by product
    const summary = {};
    for (const item of inventory) {
      if (!summary[item.productId]) {
        summary[item.productId] = {
          productId: item.productId,
          available: 0,
          reserved: 0,
          total: 0,
        };
      }
      if (item.status === 'AVAILABLE') {
        summary[item.productId].available = item._sum.quantity || 0;
      } else if (item.status === 'RESERVED') {
        summary[item.productId].reserved = item._sum.quantity || 0;
      }
      summary[item.productId].total =
        summary[item.productId].available + summary[item.productId].reserved;
    }

    const productIds = Object.keys(summary).filter(Boolean);
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        })
      : [];
    const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

    const result = Object.values(summary).map((s) => ({
      ...s,
      productName: productMap[s.productId] || s.productId,
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private (Admin, Processor)
exports.createInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.create({
      data: req.body,
      include: {
        product: true,
        farm: true,
        processingBatch: true,
      },
    });

    res.status(201).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Admin)
exports.updateInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        product: true,
        farm: true,
        processingBatch: true,
      },
    });

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
exports.deleteInventory = async (req, res) => {
  try {
    await prisma.inventory.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Delete inventory error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
