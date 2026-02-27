const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSeeds,
  getSeed,
  createSeed,
  updateSeed,
  deleteSeed,
} = require('../controllers/seedController');

router.route('/')
  .get(getSeeds)
  .post(protect, authorize('ADMIN'), createSeed);

router.route('/:id')
  .get(getSeed)
  .put(protect, authorize('ADMIN'), updateSeed)
  .delete(protect, authorize('ADMIN'), deleteSeed);

module.exports = router;
