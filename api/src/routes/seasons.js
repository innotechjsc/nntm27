const express = require('express');
const router = express.Router();
const {
  getSeasons,
  getSeason,
  getSeasonGrowthProgress,
  createSeason,
  updateSeason,
  deleteSeason,
} = require('../controllers/seasonController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getSeasons)
  .post(protect, authorize('FARMER', 'ADMIN'), createSeason);

router.get('/:id/growth-progress', getSeasonGrowthProgress);

router.route('/:id')
  .get(getSeason)
  .put(protect, updateSeason)
  .delete(protect, deleteSeason);

module.exports = router;

