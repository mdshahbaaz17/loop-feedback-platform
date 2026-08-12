import { Router } from 'express';
import { askLoop } from '../controllers/ask.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Accessible to ADMIN, ANALYST, and VIEWER roles
router.post('/', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), askLoop);

export default router;
