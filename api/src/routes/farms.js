const express = require('express');
const router = express.Router();
const {
  getFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
} = require('../controllers/farmController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getFarms)
  .post(protect, authorize('FARMER', 'ADMIN'), createFarm);

router.route('/:id')
  .get(getFarm)
  .put(protect, updateFarm)
  .delete(protect, deleteFarm);

module.exports = router;

