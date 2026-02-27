const express = require('express');
const router = express.Router();
const {
  getPlots,
  getPlot,
  createPlot,
  updatePlot,
  deletePlot,
} = require('../controllers/plotController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getPlots)
  .post(protect, authorize('FARMER', 'ADMIN'), createPlot);

router.route('/:id')
  .get(getPlot)
  .put(protect, updatePlot)
  .delete(protect, deletePlot);

module.exports = router;

