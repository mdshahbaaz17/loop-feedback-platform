import { prisma } from './prisma';

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'about', 'how', 'why', 'are', 'we', 'our', 'my', 'your', 'do',
  'does', 'did', 'have', 'has', 'had', 'can', 'could', 'should', 'would', 'any'
]);

export interface RetrievedFeedbackItem {
  id: string;
  content: string;
  source: string;
  channel: string;
  sentiment: string;
  customerLabel?: string | null;
  createdAt: Date;
}

export async function retrieveRelevantFeedback(
  workspaceId: string,
  query: string,
  limit: number = 10
): Promise<RetrievedFeedbackItem[]> {
  // Extract clean keywords from search query
  const rawTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  const terms = rawTerms.length > 0 ? rawTerms : [query.trim().toLowerCase()];

  // Query workspace items
  const items = await prisma.feedback.findMany({
    where: {
      workspaceId,
      OR: terms.flatMap(term => [
        { content: { contains: term } },
        { source: { contains: term } },
        { customerLabel: { contains: term } },
        { themes: { some: { theme: { name: { contains: term } } } } }
      ])
    },
    include: {
      themes: { include: { theme: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: Math.max(limit * 3, 30) // Over-fetch for relevance scoring
  });

  // Relevance ranking algorithm
  const scored = items.map(item => {
    let score = 0;
    const contentLower = item.content.toLowerCase();
    const sourceLower = item.source.toLowerCase();
    const labelLower = (item.customerLabel || '').toLowerCase();

    for (const term of terms) {
      if (contentLower.includes(term)) score += 3;
      if (sourceLower.includes(term)) score += 2;
      if (labelLower.includes(term)) score += 2;

      for (const t of item.themes) {
        if (t.theme.name.toLowerCase().includes(term)) score += 4;
      }
    }

    return { item, score };
  });

  // Sort descending by score, fallback to newest items if scores tie
  scored.sort((a, b) => b.score - a.score || b.item.createdAt.getTime() - a.item.createdAt.getTime());

  // Fallback: If no keyword matches found, return the top 5 newest items for context
  if (scored.length === 0 || scored[0].score === 0) {
    const fallbackItems = await prisma.feedback.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return fallbackItems.map(f => ({
      id: f.id,
      content: f.content,
      source: f.source,
      channel: f.channel,
      sentiment: f.sentiment || 'NEUTRAL',
      customerLabel: f.customerLabel,
      createdAt: f.createdAt,
    }));
  }

  return scored.slice(0, limit).map(({ item }) => ({
    id: item.id,
    content: item.content,
    source: item.source,
    channel: item.channel,
    sentiment: item.sentiment || 'NEUTRAL',
    customerLabel: item.customerLabel,
    createdAt: item.createdAt,
  }));
}
