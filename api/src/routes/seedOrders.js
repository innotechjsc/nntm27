const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSeedOrders,
  getSeedOrder,
  createSeedOrder,
  updateSeedOrderStatus,
} = require('../controllers/seedOrderController');

router.route('/')
  .get(protect, getSeedOrders)
  .post(protect, authorize('FARMER', 'ADMIN'), createSeedOrder);

router.route('/:id')
  .get(protect, getSeedOrder);

router.route('/:id/status')
  .put(protect, updateSeedOrderStatus);

module.exports = router;
