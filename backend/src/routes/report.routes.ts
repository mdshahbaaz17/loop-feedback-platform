import { Router } from 'express';
import { createReport, getReports, getReportById } from '../controllers/report.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Read routes accessible to ADMIN, ANALYST, VIEWER
router.get('/', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), getReports);
router.get('/:id', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), getReportById);

// Create report accessible to ADMIN & ANALYST
router.post('/', requireRole(['ADMIN', 'ANALYST']), createReport);

export default router;
