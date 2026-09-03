import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { generateVoCReport } from '../lib/ai';

const createReportSchema = z.object({
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
});

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.id;
    const { periodStart, periodEnd } = createReportSchema.parse(req.body);

    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    const startDate = periodStart
      ? new Date(periodStart)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Step 1: Pre-compute stats in code from real database records
    const feedbackItems = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        themes: { include: { theme: true } }
      }
    });

    const totalFeedback = feedbackItems.length;

    const sentimentCounts = {
      POSITIVE: feedbackItems.filter(f => f.sentiment === 'POSITIVE').length,
      NEUTRAL: feedbackItems.filter(f => f.sentiment === 'NEUTRAL').length,
      NEGATIVE: feedbackItems.filter(f => f.sentiment === 'NEGATIVE').length,
    };

    // Calculate theme counts
    const themeMap: Record<string, number> = {};
    for (const item of feedbackItems) {
      for (const t of item.themes) {
        themeMap[t.theme.name] = (themeMap[t.theme.name] || 0) + 1;
      }
    }

    const topThemes = Object.entries(themeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const sampleFeedback = feedbackItems.slice(0, 5).map(f => ({
      id: f.id,
      content: f.content,
      sentiment: f.sentiment || 'NEUTRAL',
    }));

    // Step 2: Call Claude to write executive narrative around pre-computed stats
    const reportData = await generateVoCReport(startDate, endDate, {
      totalFeedback,
      sentimentCounts,
      topThemes,
      sampleFeedback,
    });

    // Step 3: Persist Report entity
    const report = await prisma.report.create({
      data: {
        title: reportData.title,
        periodStart: startDate,
        periodEnd: endDate,
        summary: reportData.summary,
        keyThemes: JSON.stringify(reportData.keyThemes),
        actionableInsights: JSON.stringify(reportData.actionableInsights),
        workspaceId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    res.status(201).json({
      ...report,
      keyThemes: JSON.parse(report.keyThemes),
      actionableInsights: JSON.parse(report.actionableInsights),
    });
  } catch (error) {
    if (error instanceof z.ZodError || (error as any)?.name === 'ZodError') {
      res.status(400).json({ error: (error as any).issues || (error as any).errors || error });
    } else {
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;

    const reports = await prisma.report.findMany({
      where: { workspaceId },
      include: {
        createdBy: {
          select: { id: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = reports.map(r => ({
      ...r,
      keyThemes: JSON.parse(r.keyThemes),
      actionableInsights: JSON.parse(r.actionableInsights),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const id = req.params.id as string;

    const report = await prisma.report.findFirst({
      where: { id, workspaceId },
      include: {
        createdBy: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      ...report,
      keyThemes: JSON.parse(report.keyThemes),
      actionableInsights: JSON.parse(report.actionableInsights),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report detail' });
  }
};
