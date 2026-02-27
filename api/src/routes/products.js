const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('ADMIN', 'PROCESSOR'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('ADMIN', 'PROCESSOR'), updateProduct)
  .delete(protect, authorize('ADMIN'), deleteProduct);

module.exports = router;
