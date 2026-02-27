const express = require('express');
const router = express.Router();
const {
  getPublicPlots,
  getPublicStats,
  getFeaturedFarms,
  getPublicProducts,
  getRegionsSummary,
} = require('../controllers/publicController');

router.get('/plots', getPublicPlots);
router.get('/stats', getPublicStats);
router.get('/featured-farms', getFeaturedFarms);
router.get('/products', getPublicProducts);
router.get('/regions-summary', getRegionsSummary);

module.exports = router;
