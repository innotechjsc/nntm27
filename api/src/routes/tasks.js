const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  suggestTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getTasks)
  .post(protect, authorize('FARMER', 'ADMIN'), createTask);

router.post('/suggest', protect, authorize('FARMER', 'ADMIN'), suggestTasks);

router.route('/:id')
  .get(getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;

