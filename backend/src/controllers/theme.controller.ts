import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const createThemeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const getThemes = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;

    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { feedbacks: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = themes.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      feedbackCount: t._count.feedbacks,
      createdAt: t.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
};

export const createTheme = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { name, description } = createThemeSchema.parse(req.body);

    const existing = await prisma.theme.findFirst({
      where: { workspaceId, name }
    });

    if (existing) {
      return res.status(400).json({ error: 'Theme with this name already exists in workspace' });
    }

    const theme = await prisma.theme.create({
      data: {
        name,
        description,
        workspaceId,
      }
    });

    res.status(201).json(theme);
  } catch (error) {
    if (error instanceof z.ZodError || (error as any)?.name === 'ZodError') {
      res.status(400).json({ error: (error as any).issues || (error as any).errors || error });
    } else {
      res.status(500).json({ error: 'Failed to create theme' });
    }
  }
};

export const getThemeTrends = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        feedbacks: {
          include: {
            feedback: {
              select: { createdAt: true }
            }
          }
        }
      }
    });

    const trends = themes.map(theme => {
      const currentPeriodCount = theme.feedbacks.filter(f => f.feedback.createdAt >= sevenDaysAgo).length;
      const previousPeriodCount = theme.feedbacks.filter(f => 
        f.feedback.createdAt >= fourteenDaysAgo && f.feedback.createdAt < sevenDaysAgo
      ).length;

      let percentageChange = 0;
      if (previousPeriodCount > 0) {
        percentageChange = Math.round(((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100);
      } else if (currentPeriodCount > 0) {
        percentageChange = 100;
      }

      const isSpike = currentPeriodCount >= 3 && (previousPeriodCount === 0 || percentageChange >= 50);

      return {
        themeId: theme.id,
        themeName: theme.name,
        currentPeriodCount,
        previousPeriodCount,
        percentageChange,
        isSpike,
      };
    });

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate theme trends' });
  }
};
