const { prisma } = require('../config/database');

// Generate unique order number
const generateOrderNumber = () => {
  return `SO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// @desc    Get all seed orders
// @route   GET /api/seed-orders
// @access  Private
exports.getSeedOrders = async (req, res) => {
  try {
    const { farmerId, status } = req.query;
    const where = {};
    
    // Farmers can only see their own orders, admin can see all
    if (req.user.role !== 'ADMIN' && req.user.role !== 'FARMER') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }
    
    if (req.user.role === 'FARMER') {
      where.farmerId = req.user.id;
    } else if (farmerId) {
      where.farmerId = farmerId;
    }
    
    if (status) where.status = status;

    const orders = await prisma.seedOrder.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            seedVariety: {
              include: {
                crop: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get seed orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single seed order
// @route   GET /api/seed-orders/:id
// @access  Private
exports.getSeedOrder = async (req, res) => {
  try {
    const order = await prisma.seedOrder.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            seedVariety: {
              include: {
                crop: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Seed order not found',
      });
    }

    // Check authorization
    if (req.user.role === 'FARMER' && order.farmerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get seed order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create seed order (Mua hạt giống)
// @route   POST /api/seed-orders
// @access  Private (Farmer)
exports.createSeedOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const seed = await prisma.seedVariety.findUnique({
        where: { id: item.seedVarietyId },
      });

      if (!seed) {
        return res.status(400).json({
          success: false,
          message: `Seed variety ${item.seedVarietyId} not found`,
        });
      }

      if (!seed.isActive) {
        return res.status(400).json({
          success: false,
          message: `Seed variety ${seed.name} is not available`,
        });
      }

      if (seed.quantityInStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${seed.name}. Available: ${seed.quantityInStock} ${seed.unit}`,
        });
      }

      const itemTotal = seed.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        seedVarietyId: item.seedVarietyId,
        quantity: item.quantity,
        unitPrice: seed.price,
        totalPrice: itemTotal,
      });
    }

    // Create order with items
    const order = await prisma.seedOrder.create({
      data: {
        farmerId: req.user.id,
        orderNumber: generateOrderNumber(),
        totalAmount,
        shippingAddress,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        farmer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            seedVariety: {
              include: {
                crop: true,
              },
            },
          },
        },
      },
    });

    // Update stock (in production, use transactions)
    for (const item of items) {
      await prisma.seedVariety.update({
        where: { id: item.seedVarietyId },
        data: {
          quantityInStock: {
            decrement: item.quantity,
          },
        },
      });
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create seed order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update seed order status
// @route   PUT /api/seed-orders/:id/status
// @access  Private (Admin, Farmer for cancellation)
exports.updateSeedOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.seedOrder.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Seed order not found',
      });
    }

    // Authorization checks
    if (req.user.role === 'FARMER') {
      if (order.farmerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }
      // Farmers can only cancel
      if (status !== 'CANCELLED') {
        return res.status(403).json({
          success: false,
          message: 'Farmers can only cancel orders',
        });
      }
    }

    const updatedOrder = await prisma.seedOrder.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        farmer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            seedVariety: {
              include: {
                crop: true,
              },
            },
          },
        },
      },
    });

    // If cancelled, restore stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        await prisma.seedVariety.update({
          where: { id: item.seedVarietyId },
          data: {
            quantityInStock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update seed order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
