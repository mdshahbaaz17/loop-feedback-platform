import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * GET /api/analytics/overview
 * Returns workspace-scoped KPI summary: total feedback, sentiment breakdown, avg sentiment score, active themes count.
 */
export const getAnalyticsOverview = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;

    // Total feedback items
    const totalFeedback = await prisma.feedback.count({
      where: { workspaceId },
    });

    // Sentiment breakdown
    const positiveCount = await prisma.feedback.count({
      where: { workspaceId, sentiment: 'POSITIVE' },
    });
    const neutralCount = await prisma.feedback.count({
      where: { workspaceId, sentiment: 'NEUTRAL' },
    });
    const negativeCount = await prisma.feedback.count({
      where: { workspaceId, sentiment: 'NEGATIVE' },
    });

    // Average sentiment score (-1.0 to 1.0)
    const aggregateScore = await prisma.feedback.aggregate({
      where: { workspaceId },
      _avg: { sentimentScore: true },
    });

    // Total active themes
    const totalThemes = await prisma.theme.count({
      where: { workspaceId },
    });

    // Calculate percentages safely
    const positiveRatio = totalFeedback > 0 ? Number(((positiveCount / totalFeedback) * 100).toFixed(1)) : 0;
    const neutralRatio = totalFeedback > 0 ? Number(((neutralCount / totalFeedback) * 100).toFixed(1)) : 0;
    const negativeRatio = totalFeedback > 0 ? Number(((negativeCount / totalFeedback) * 100).toFixed(1)) : 0;

    res.json({
      totalFeedback,
      sentimentBreakdown: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
        positiveRatio,
        neutralRatio,
        negativeRatio,
      },
      averageSentimentScore: Number((aggregateScore._avg.sentimentScore || 0).toFixed(2)),
      totalThemes,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

/**
 * GET /api/analytics/sentiment-trend
 * Returns historical time-series aggregation of feedback volume and average sentiment.
 */
export const getSentimentTrend = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const feedbackItems = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        sentiment: true,
        sentimentScore: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group items by YYYY-MM-DD
    const trendMap: Record<string, { date: string; total: number; positive: number; neutral: number; negative: number; sumScore: number }> = {};

    feedbackItems.forEach((item) => {
      const dateStr = item.createdAt.toISOString().split('T')[0];
      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { date: dateStr, total: 0, positive: 0, neutral: 0, negative: 0, sumScore: 0 };
      }
      trendMap[dateStr].total += 1;
      if (item.sentiment === 'POSITIVE') trendMap[dateStr].positive += 1;
      if (item.sentiment === 'NEUTRAL') trendMap[dateStr].neutral += 1;
      if (item.sentiment === 'NEGATIVE') trendMap[dateStr].negative += 1;
      trendMap[dateStr].sumScore += item.sentimentScore ?? 0;
    });

    const trend = Object.values(trendMap).map((d) => ({
      date: d.date,
      total: d.total,
      positive: d.positive,
      neutral: d.neutral,
      negative: d.negative,
      averageSentimentScore: d.total > 0 ? Number((d.sumScore / d.total).toFixed(2)) : 0,
    }));

    res.json({ days, trend });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

/**
 * GET /api/analytics/channels
 * Returns distribution and average sentiment score grouped by feedback channel.
 */
export const getChannelBreakdown = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;

    const channelGroups = await prisma.feedback.groupBy({
      by: ['channel'],
      where: { workspaceId },
      _count: { id: true },
      _avg: { sentimentScore: true },
    });

    const breakdown = channelGroups.map((g) => ({
      channel: g.channel || 'UNSPECIFIED',
      count: g._count.id,
      averageSentimentScore: Number((g._avg.sentimentScore || 0).toFixed(2)),
    }));

    res.json({ breakdown });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
