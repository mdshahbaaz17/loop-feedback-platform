import { Router } from 'express';
import { getAnalyticsOverview, getSentimentTrend, getChannelBreakdown } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protect all analytics endpoints with authentication middleware
router.use(authenticate);

router.get('/overview', getAnalyticsOverview);
router.get('/sentiment-trend', getSentimentTrend);
router.get('/channels', getChannelBreakdown);

export default router;
