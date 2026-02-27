const express = require('express');
const router = express.Router();
const {
  getCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
} = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getCrops)
  .post(protect, authorize('ADMIN'), createCrop);

router.route('/:id')
  .get(getCrop)
  .put(protect, authorize('ADMIN'), updateCrop)
  .delete(protect, authorize('ADMIN'), deleteCrop);

module.exports = router;

