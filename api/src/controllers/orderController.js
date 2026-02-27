const { prisma } = require('../config/database');

// Generate unique order number
const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { customerId, status, paymentStatus } = req.query;
    const where = {};
    
    // Customers can only see their own orders, admin/distributor can see all
    if (req.user.role !== 'ADMIN' && req.user.role !== 'DISTRIBUTOR') {
      if (req.user.role === 'FARMER') {
        // Farmers might be customers too
        where.customerId = req.user.id;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }
    } else {
      if (customerId) where.customerId = customerId;
    }
    
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
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
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && req.user.role !== 'DISTRIBUTOR') {
      if (order.customerId && order.customerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this order',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create order (Phân phối)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
      });
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone, and shipping address are required',
      });
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          inventoryItems: {
            where: {
              status: 'AVAILABLE',
            },
          },
        },
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`,
        });
      }

      // Check available inventory
      const availableQuantity = product.inventoryItems.reduce(
        (sum, inv) => sum + inv.quantity,
        0
      );

      if (availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${product.name}. Available: ${availableQuantity} ${product.unit}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        notes: item.notes,
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: req.user.role !== 'ADMIN' ? req.user.id : null,
        orderNumber: generateOrderNumber(),
        customerName,
        customerEmail: customerEmail || req.user.email,
        customerPhone,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        totalAmount,
        paymentMethod,
        shippingMethod,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Reserve inventory (in production, use transactions)
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          inventoryItems: {
            where: {
              status: 'AVAILABLE',
            },
            orderBy: {
              createdAt: 'asc', // FIFO
            },
          },
        },
      });

      let remaining = item.quantity;
      for (const inv of product.inventoryItems) {
        if (remaining <= 0) break;
        const quantityToReserve = Math.min(remaining, inv.quantity);
        
        await prisma.inventory.update({
          where: { id: inv.id },
          data: {
            status: 'RESERVED',
            quantity: {
              decrement: quantityToReserve,
            },
          },
        });

        // Create new reserved inventory record if partial
        if (quantityToReserve < inv.quantity) {
          await prisma.inventory.create({
            data: {
              productId: item.productId,
              quantity: inv.quantity - quantityToReserve,
              unit: inv.unit,
              location: inv.location,
              status: 'AVAILABLE',
              batchNumber: inv.batchNumber,
            },
          });
        }

        remaining -= quantityToReserve;
      }
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin, Distributor)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const updateData = { status };
    if (status === 'SHIPPED' && trackingNumber) {
      updateData.trackingNumber = trackingNumber;
      updateData.shippedAt = new Date();
    }
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private (Admin)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { paymentStatus },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
