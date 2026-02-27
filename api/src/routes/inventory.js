const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getInventory,
  getInventoryItem,
  getInventorySummary,
  createInventory,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');

router.route('/')
  .get(protect, getInventory)
  .post(protect, authorize('ADMIN', 'PROCESSOR'), createInventory);

router.route('/summary')
  .get(protect, getInventorySummary);

router.route('/:id')
  .get(protect, getInventoryItem)
  .put(protect, authorize('ADMIN'), updateInventory)
  .delete(protect, authorize('ADMIN'), deleteInventory);

module.exports = router;
