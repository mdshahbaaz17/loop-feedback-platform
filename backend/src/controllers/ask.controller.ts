import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { retrieveRelevantFeedback } from '../lib/search';
import { generateAskLoopAnswer } from '../lib/ai';

const askSchema = z.object({
  query: z.string().min(1, 'Question query cannot be empty'),
});

export const askLoop = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const { query } = askSchema.parse(req.body);

    // Step 1: Grounded retrieval of relevant context items from database
    const contextItems = await retrieveRelevantFeedback(workspaceId, query, 10);

    // Step 2: Ask Claude for a strictly grounded answer with item citations
    const result = await generateAskLoopAnswer(query, contextItems);

    // Step 3: Map cited item details for frontend citation cards
    const citedFeedback = contextItems.filter(item => result.citedIds.includes(item.id));

    res.json({
      answer: result.answer,
      citedFeedback: citedFeedback.length > 0 ? citedFeedback : contextItems.slice(0, 3),
      totalRetrieved: contextItems.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to process Ask LOOP query' });
    }
  }
};
