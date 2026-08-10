import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const createFeedbackSchema = z.object({
  content: z.string().min(1),
  source: z.string().min(1),
  channel: z.string().optional().default('EMAIL'),
  customerLabel: z.string().optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  sentimentScore: z.number().optional(),
  themeIds: z.array(z.string()).optional(),
});

const updateFeedbackSchema = z.object({
  content: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
  channel: z.string().optional(),
  customerLabel: z.string().optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  sentimentScore: z.number().optional(),
  status: z.enum(['NEW', 'REVIEWED', 'RESOLVED']).optional(),
  themeIds: z.array(z.string()).optional(),
});

const importCSVSchema = z.array(z.object({
  content: z.string().min(1),
  source: z.string().min(1),
  channel: z.string().optional().default('EMAIL'),
  customerLabel: z.string().optional(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  status: z.enum(['NEW', 'REVIEWED', 'RESOLVED']).optional().default('NEW'),
}));

export const getFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const { search, sentiment, status, channel, themeId, startDate, endDate } = req.query;

    const where: any = { workspaceId };

    if (search && typeof search === 'string') {
      where.OR = [
        { content: { contains: search } },
        { source: { contains: search } },
        { customerLabel: { contains: search } },
      ];
    }

    if (sentiment && typeof sentiment === 'string') {
      where.sentiment = sentiment;
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (channel && typeof channel === 'string') {
      where.channel = channel;
    }

    if (themeId && typeof themeId === 'string') {
      where.themes = {
        some: { themeId }
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && typeof startDate === 'string') {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [total, feedback] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        include: {
          themes: {
            include: { theme: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })
    ]);

    res.json({
      data: feedback,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

export const getFeedbackById = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { id } = req.params;

    const item = await prisma.feedback.findFirst({
      where: { id, workspaceId },
      include: {
        themes: {
          include: { theme: true }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback item' });
  }
};

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { content, source, channel, customerLabel, sentiment, sentimentScore, themeIds } = createFeedbackSchema.parse(req.body);

    const feedback = await prisma.feedback.create({
      data: {
        content,
        source,
        channel: channel || 'EMAIL',
        customerLabel,
        sentiment,
        sentimentScore,
        workspaceId,
        status: 'NEW',
        themes: themeIds && themeIds.length > 0 ? {
          create: themeIds.map(tId => ({ themeId: tId }))
        } : undefined
      },
      include: {
        themes: { include: { theme: true } }
      }
    });

    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create feedback' });
    }
  }
};

export const updateFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { id } = req.params;
    const data = updateFeedbackSchema.parse(req.body);

    const existing = await prisma.feedback.findFirst({
      where: { id, workspaceId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    if (data.themeIds) {
      await prisma.feedbackTheme.deleteMany({ where: { feedbackId: id } });
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: {
        content: data.content,
        source: data.source,
        channel: data.channel,
        customerLabel: data.customerLabel,
        sentiment: data.sentiment,
        sentimentScore: data.sentimentScore,
        status: data.status,
        themes: data.themeIds ? {
          create: data.themeIds.map(tId => ({ themeId: tId }))
        } : undefined
      },
      include: {
        themes: { include: { theme: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update feedback' });
    }
  }
};

export const importCSV = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const items = importCSVSchema.parse(req.body);

    const created = await prisma.feedback.createMany({
      data: items.map(item => ({
        content: item.content,
        source: item.source,
        channel: item.channel || 'EMAIL',
        customerLabel: item.customerLabel,
        sentiment: item.sentiment,
        status: item.status || 'NEW',
        workspaceId,
      }))
    });

    res.status(201).json({ message: 'Import successful', count: created.count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to import CSV data' });
    }
  }
};

export const seedChannelData = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;

    const sampleFeedbacks = [
      { content: "App crashes when opening settings on Android 14.", source: "Play Store", channel: "APP_STORE", sentiment: "NEGATIVE" as const, customerLabel: "Free Tier" },
      { content: "Love the new dashboard UI, so easy to track metrics!", source: "Intercom", channel: "INTERCOM", sentiment: "POSITIVE" as const, customerLabel: "Enterprise" },
      { content: "Could you add support for webhook triggers?", source: "Zendesk", channel: "ZENDESK", sentiment: "NEUTRAL" as const, customerLabel: "SMB" },
    ];

    const created = await prisma.feedback.createMany({
      data: sampleFeedbacks.map(f => ({
        ...f,
        workspaceId,
        status: 'NEW',
      }))
    });

    res.status(201).json({ message: 'Channel seed data added', count: created.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed channel data' });
  }
};
