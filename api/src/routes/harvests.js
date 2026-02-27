const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getHarvests,
  getHarvest,
  exportHarvests,
  createHarvest,
  updateHarvest,
} = require('../controllers/harvestController');

router.route('/')
  .get(protect, getHarvests)
  .post(protect, authorize('FARMER', 'ADMIN'), createHarvest);

router.get('/export', protect, exportHarvests);

router.route('/:id')
  .get(protect, getHarvest)
  .put(protect, authorize('FARMER', 'ADMIN'), updateHarvest);

module.exports = router;
