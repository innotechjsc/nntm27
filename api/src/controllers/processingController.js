const { prisma } = require('../config/database');

// @desc    Get all processing batches
// @route   GET /api/processing
// @access  Private
exports.getProcessingBatches = async (req, res) => {
  try {
    const { harvestId, status } = req.query;
    const where = {};
    
    if (harvestId) where.harvestId = harvestId;
    if (status) where.status = status;

    const batches = await prisma.processingBatch.findMany({
      where,
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
        products: true,
        inventoryItems: true,
      },
      orderBy: { startDate: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    console.error('Get processing batches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single processing batch
// @route   GET /api/processing/:id
// @access  Private
exports.getProcessingBatch = async (req, res) => {
  try {
    const batch = await prisma.processingBatch.findUnique({
      where: { id: req.params.id },
      include: {
        harvest: {
          include: {
            plot: {
              include: {
                farm: true,
              },
            },
            season: true,
          },
        },
        products: true,
        inventoryItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Processing batch not found',
      });
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error('Get processing batch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create processing batch (Chế biến)
// @route   POST /api/processing
// @access  Private (Processor, Admin)
exports.createProcessingBatch = async (req, res) => {
  try {
    const {
      name,
      harvestId,
      startDate,
      processingType,
      inputQuantity,
      qualityGrade,
      certifications,
      notes,
    } = req.body;

    if (!name || !harvestId || !startDate || !processingType || !inputQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Name, harvest ID, start date, processing type, and input quantity are required',
      });
    }

    // Verify harvest exists
    const harvest = await prisma.harvest.findUnique({
      where: { id: harvestId },
    });

    if (!harvest) {
      return res.status(404).json({
        success: false,
        message: 'Harvest not found',
      });
    }

    const batch = await prisma.processingBatch.create({
      data: {
        name,
        processorId: req.user.role === 'PROCESSOR' ? req.user.id : null,
        harvestId,
        startDate: new Date(startDate),
        processingType,
        inputQuantity,
        qualityGrade,
        certifications: certifications || [],
        notes,
        status: 'IN_PROGRESS',
      },
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
    });

    res.status(201).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error('Create processing batch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update processing batch
// @route   PUT /api/processing/:id
// @access  Private (Processor, Admin)
exports.updateProcessingBatch = async (req, res) => {
  try {
    const batch = await prisma.processingBatch.findUnique({
      where: { id: req.params.id },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Processing batch not found',
      });
    }

    // Authorization check
    if (req.user.role !== 'ADMIN' && batch.processorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this processing batch',
      });
    }

    const updatedBatch = await prisma.processingBatch.update({
      where: { id: req.params.id },
      data: req.body,
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
        products: true,
        inventoryItems: true,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedBatch,
    });
  } catch (error) {
    console.error('Update processing batch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Complete processing batch and create inventory
// @route   POST /api/processing/:id/complete
// @access  Private (Processor, Admin)
exports.completeProcessingBatch = async (req, res) => {
  try {
    const { outputQuantity, wasteQuantity, products } = req.body;

    const batch = await prisma.processingBatch.findUnique({
      where: { id: req.params.id },
      include: {
        harvest: true,
      },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Processing batch not found',
      });
    }

    // Authorization check
    if (req.user.role !== 'ADMIN' && batch.processorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update batch
    const updatedBatch = await prisma.processingBatch.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
        outputQuantity: outputQuantity || batch.inputQuantity,
        wasteQuantity: wasteQuantity || 0,
      },
      include: {
        products: true,
        inventoryItems: true,
      },
    });

    // Create inventory items for products if provided
    if (products && Array.isArray(products)) {
      for (const product of products) {
        if (product.productId && product.quantity) {
          await prisma.inventory.create({
            data: {
              productId: product.productId,
              processingBatchId: batch.id,
              quantity: product.quantity,
              unit: product.unit || 'kg',
              location: product.location,
              batchNumber: product.batchNumber,
              status: 'AVAILABLE',
            },
          });
        }
      }
    }

    const finalBatch = await prisma.processingBatch.findUnique({
      where: { id: req.params.id },
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
        products: true,
        inventoryItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: finalBatch,
    });
  } catch (error) {
    console.error('Complete processing batch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
