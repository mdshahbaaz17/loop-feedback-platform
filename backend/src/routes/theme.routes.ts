import { Router } from 'express';
import { getThemes, createTheme, getThemeTrends } from '../controllers/theme.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), getThemes);
router.post('/', requireRole(['ADMIN', 'ANALYST']), createTheme);
router.get('/trends', requireRole(['ADMIN', 'ANALYST', 'VIEWER']), getThemeTrends);

export default router;
