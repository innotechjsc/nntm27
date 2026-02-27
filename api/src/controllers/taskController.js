const { prisma } = require('../config/database');

const TASK_TYPES = ['WATERING', 'FERTILIZING', 'SPRAYING', 'PRUNING', 'HARVESTING', 'WEEDING', 'PLANTING', 'MONITORING', 'OTHER'];
const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

// @desc    Get suggested tasks for a season (D3 - gợi ý task theo mùa vụ & cây trồng)
// @route   POST /api/tasks/suggest
// @access  Private (FARMER, ADMIN)
exports.suggestTasks = async (req, res) => {
  try {
    const { seasonId } = req.body;
    if (!seasonId) {
      return res.status(400).json({
        success: false,
        message: 'seasonId is required',
      });
    }

    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        plot: { select: { id: true, name: true } },
        crop: { select: { id: true, name: true, growthPeriod: true } },
      },
    });

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found',
      });
    }

    const growthPeriod = season.crop?.growthPeriod || 90;
    const start = new Date(season.startDate);
    const suggestions = [];

    // Tưới nước: mỗi 3-5 ngày (ước tính mỗi 4 ngày)
    const wateringInterval = 4;
    for (let d = wateringInterval; d < growthPeriod; d += wateringInterval) {
      const date = new Date(start);
      date.setDate(date.getDate() + d);
      if (date > new Date()) {
        suggestions.push({
          type: 'WATERING',
          title: `Tưới nước - ${season.crop?.name || 'Cây trồng'}`,
          description: `Tưới nước định kỳ (ngày ${d}/${growthPeriod})`,
          scheduledDate: date.toISOString().split('T')[0],
          plotId: season.plotId,
          seasonId: season.id,
        });
        if (suggestions.filter((s) => s.type === 'WATERING').length >= 3) break;
      }
    }

    // Bón phân: 1/3 và 2/3 chu kỳ
    [Math.floor(growthPeriod / 3), Math.floor((growthPeriod * 2) / 3)].forEach((d) => {
      const date = new Date(start);
      date.setDate(date.getDate() + d);
      if (date > new Date()) {
        suggestions.push({
          type: 'FERTILIZING',
          title: `Bón phân - ${season.crop?.name || 'Cây trồng'}`,
          description: `Bón phân giai đoạn ${d <= growthPeriod / 2 ? 'đầu' : 'giữa'} (ngày ${d}/${growthPeriod})`,
          scheduledDate: date.toISOString().split('T')[0],
          plotId: season.plotId,
          seasonId: season.id,
        });
      }
    });

    // Nhổ cỏ: tuần 2 và tuần 4
    [14, 28].forEach((d) => {
      if (d < growthPeriod) {
        const date = new Date(start);
        date.setDate(date.getDate() + d);
        if (date > new Date()) {
          suggestions.push({
            type: 'WEEDING',
            title: `Nhổ cỏ - ${season.plot?.name || 'Lô'}`,
            description: `Nhổ cỏ dại (tuần ${d / 7})`,
            scheduledDate: date.toISOString().split('T')[0],
            plotId: season.plotId,
            seasonId: season.id,
          });
        }
      }
    });

    // Giám sát: 2 tuần trước thu hoạch
    const monitorDay = Math.max(0, growthPeriod - 14);
    const monitorDate = new Date(start);
    monitorDate.setDate(monitorDate.getDate() + monitorDay);
    if (monitorDate > new Date() && monitorDay > 0) {
      suggestions.push({
        type: 'MONITORING',
        title: `Giám sát trước thu hoạch - ${season.crop?.name || 'Cây trồng'}`,
        description: 'Kiểm tra sâu bệnh, độ chín',
        scheduledDate: monitorDate.toISOString().split('T')[0],
        plotId: season.plotId,
        seasonId: season.id,
      });
    }

    suggestions.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
exports.getTasks = async (req, res) => {
  try {
    const { plotId, seasonId, status, assignedToId } = req.query;
    const where = {};
    if (plotId) where.plotId = plotId;
    if (seasonId) where.seasonId = seasonId;
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        plot: { include: { farm: { select: { id: true, name: true } } } },
        season: { include: { crop: { select: { id: true, name: true } } } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
exports.getTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        plot: { include: { farm: { select: { id: true, name: true, ownerId: true } } } },
        season: { include: { crop: { select: { name: true, growthPeriod: true } } } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new task (chăm sóc)
// @route   POST /api/tasks
// @access  Private (FARMER, ADMIN)
exports.createTask = async (req, res) => {
  try {
    const {
      plotId,
      seasonId,
      title,
      description,
      type,
      scheduledDate,
      assignedToId,
      notes,
      isRecurring,
      recurringPattern,
      metadata,
    } = req.body;
    const pid = plotId || req.body.plot;

    if (!pid || !title || !type || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide plotId, title, type, scheduledDate',
      });
    }

    if (!TASK_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `type must be one of: ${TASK_TYPES.join(', ')}`,
      });
    }

    const plot = await prisma.plot.findUnique({
      where: { id: pid },
      include: { farm: { select: { ownerId: true } } },
    });
    if (!plot) {
      return res.status(404).json({ success: false, message: 'Plot not found' });
    }

    if (plot.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create task for this plot',
      });
    }

    const task = await prisma.task.create({
      data: {
        plotId: pid,
        seasonId: seasonId || null,
        title,
        description: description || null,
        type,
        scheduledDate: new Date(scheduledDate),
        assignedToId: assignedToId || null,
        notes: notes || null,
        isRecurring: Boolean(isRecurring),
        recurringPattern: recurringPattern || null,
        metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
        status: 'PENDING',
      },
      include: {
        plot: { select: { id: true, name: true } },
        season: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { plot: { include: { farm: { select: { ownerId: true } } } } },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (existing.plot.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    const {
      title,
      description,
      type,
      scheduledDate,
      completedDate,
      status,
      assignedToId,
      notes,
      isRecurring,
      recurringPattern,
      metadata,
    } = req.body;
    const data = {};
    if (title != null) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (type != null) {
      if (!TASK_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: `type must be one of: ${TASK_TYPES.join(', ')}` });
      }
      data.type = type;
    }
    if (scheduledDate != null) data.scheduledDate = new Date(scheduledDate);
    if (completedDate !== undefined) data.completedDate = completedDate ? new Date(completedDate) : null;
    if (status != null) {
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `status must be one of: ${TASK_STATUSES.join(', ')}` });
      }
      data.status = status;
    }
    if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
    if (notes !== undefined) data.notes = notes || null;
    if (isRecurring !== undefined) data.isRecurring = Boolean(isRecurring);
    if (recurringPattern !== undefined) data.recurringPattern = recurringPattern || null;
    if (metadata !== undefined && typeof metadata === 'object') data.metadata = metadata;

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: {
        plot: { select: { id: true, name: true } },
        season: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
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

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { plot: { include: { farm: { select: { ownerId: true } } } } },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.plot.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    await prisma.task.delete({
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
