const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
} = require('../controllers/orderController');

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id')
  .get(protect, getOrder);

router.route('/:id/status')
  .put(protect, authorize('ADMIN', 'DISTRIBUTOR'), updateOrderStatus);

router.route('/:id/payment')
  .put(protect, authorize('ADMIN'), updatePaymentStatus);

module.exports = router;
