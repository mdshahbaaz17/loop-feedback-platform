import { Router } from 'express';
import {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  reclassifyFeedback,
  backfillClassification,
  importCSV,
  seedChannelData
} from '../controllers/feedback.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate); // Require valid JWT for all routes

// Read actions accessible to ADMIN, ANALYST, VIEWER
router.get('/', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), getFeedback);
router.get('/:id', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), getFeedbackById);

// Write/Update actions accessible to ADMIN & ANALYST
router.post('/', requireRole(['ADMIN', 'ANALYST']), createFeedback);
router.patch('/:id', requireRole(['ADMIN', 'ANALYST']), updateFeedback);
router.post('/:id/reclassify', requireRole(['ADMIN', 'ANALYST']), reclassifyFeedback);
router.post('/backfill', requireRole(['ADMIN', 'ANALYST']), backfillClassification);
router.post('/import', requireRole(['ADMIN', 'ANALYST']), importCSV);
router.post('/seed', requireRole(['ADMIN', 'ANALYST']), seedChannelData);

export default router;
