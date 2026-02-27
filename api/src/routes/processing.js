const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProcessingBatches,
  getProcessingBatch,
  createProcessingBatch,
  updateProcessingBatch,
  completeProcessingBatch,
} = require('../controllers/processingController');

router.route('/')
  .get(protect, getProcessingBatches)
  .post(protect, authorize('PROCESSOR', 'ADMIN'), createProcessingBatch);

router.route('/:id')
  .get(protect, getProcessingBatch)
  .put(protect, authorize('PROCESSOR', 'ADMIN'), updateProcessingBatch);

router.route('/:id/complete')
  .post(protect, authorize('PROCESSOR', 'ADMIN'), completeProcessingBatch);

module.exports = router;
