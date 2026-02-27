const express = require('express');
const router = express.Router();
const {
  getRegions,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion,
} = require('../controllers/regionController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getRegions)
  .post(protect, authorize('ADMIN'), createRegion);

router.route('/:id')
  .get(getRegion)
  .put(protect, authorize('ADMIN'), updateRegion)
  .delete(protect, authorize('ADMIN'), deleteRegion);

module.exports = router;

