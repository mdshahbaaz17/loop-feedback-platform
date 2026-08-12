import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const apiKey = process.env.ANTHROPIC_API_KEY || '';
const isApiKeyValid = apiKey.startsWith('sk-ant-') && !apiKey.includes('sk-ant-...');

const anthropic = isApiKeyValid ? new Anthropic({ apiKey }) : null;

// Zod schemas for strict AI output parsing
export const classificationResultSchema = z.object({
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  sentimentScore: z.number().min(-1).max(1),
  customerLabel: z.string().optional(),
  matchedThemes: z.array(z.string()),
  newSuggestedTheme: z.string().optional(),
});

export type ClassificationResult = z.infer<typeof classificationResultSchema>;

export const reportResultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyThemes: z.array(z.string()),
  actionableInsights: z.array(z.string()),
});

export type ReportResult = z.infer<typeof reportResultSchema>;

/**
 * 1. AI Classification & Theme Matching (AI1)
 */
export async function classifyFeedback(
  content: string,
  availableThemes: string[]
): Promise<ClassificationResult> {
  if (!anthropic) {
    // Graceful fallback for local development without active key
    const isNeg = content.toLowerCase().includes('slow') || content.toLowerCase().includes('crash') || content.toLowerCase().includes('bug') || content.toLowerCase().includes('issue') || content.toLowerCase().includes('fail') || content.toLowerCase().includes('error');
    const isPos = content.toLowerCase().includes('love') || content.toLowerCase().includes('great') || content.toLowerCase().includes('awesome') || content.toLowerCase().includes('fantastic') || content.toLowerCase().includes('clean');

    const sentiment = isNeg ? 'NEGATIVE' : isPos ? 'POSITIVE' : 'NEUTRAL';
    const sentimentScore = isNeg ? -0.7 : isPos ? 0.8 : 0.0;
    
    // Pick theme match based on simple heuristic fallback
    const matched = availableThemes.filter(t => 
      content.toLowerCase().includes(t.toLowerCase().split(' ')[0])
    );

    return {
      sentiment,
      sentimentScore,
      customerLabel: 'Standard Segment',
      matchedThemes: matched.length > 0 ? matched : (availableThemes.slice(0, 1) || ['General']),
    };
  }

  try {
    const prompt = `Analyze the following customer feedback item and output ONLY a raw, valid JSON object with no additional text or Markdown formatting.

Available Themes: ${JSON.stringify(availableThemes)}

Feedback Item:
"${content}"

JSON Schema:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "sentimentScore": number between -1.0 and 1.0,
  "customerLabel": "string segment name or null",
  "matchedThemes": ["array of exact strings from Available Themes that apply"],
  "newSuggestedTheme": "optional string if none of Available Themes fit"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleanJson = text.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
    const parsed = JSON.parse(cleanJson);

    return classificationResultSchema.parse(parsed);
  } catch (err) {
    console.warn('⚠️ Anthropic API call failed or unparseable, using fallback classification:', err);
    return {
      sentiment: 'NEUTRAL',
      sentimentScore: 0.0,
      customerLabel: 'General Segment',
      matchedThemes: availableThemes.slice(0, 1) || ['General'],
    };
  }
}

/**
 * 2. Grounded Q&A / Ask LOOP (AI3)
 */
export async function generateAskLoopAnswer(
  query: string,
  contextItems: Array<{ id: string; content: string; source: string; channel: string; sentiment: string; customerLabel?: string | null }>
): Promise<{ answer: string; citedIds: string[] }> {
  if (contextItems.length === 0) {
    return {
      answer: 'Based on the retrieved feedback in your workspace, there is no customer feedback available regarding this question.',
      citedIds: [],
    };
  }

  const contextFormatted = contextItems
    .map(item => `[ID: ${item.id}] (Channel: ${item.channel}, Source: ${item.source}, Sentiment: ${item.sentiment}): "${item.content}"`)
    .join('\n');

  if (!anthropic) {
    // Development fallback answer referencing actual items
    const citedIds = contextItems.slice(0, 3).map(i => i.id);
    const summaryList = contextItems.slice(0, 3).map(i => `• ${i.content} [${i.id}]`).join('\n');
    return {
      answer: `Based on customer feedback in your workspace regarding "${query}":\n\n${summaryList}\n\nOverall, customers highlighted these points across ${contextItems.length} retrieved items.`,
      citedIds,
    };
  }

  try {
    const systemPrompt = `You are Ask LOOP, an AI product analyst assistant. Your job is to answer the user's question using ONLY the retrieved customer feedback items provided in context.

CRITICAL GROUNDING RULES:
1. Answer ONLY using the facts explicitly stated in the retrieved feedback.
2. DO NOT invent, hallucinate, assume, or extrapolate facts beyond what is stated.
3. Reference source items using their exact ID format [ID: <id>] in your text when stating facts.
4. If the retrieved items do NOT contain sufficient information to answer the question, state explicitly: "Based on the retrieved feedback, there is no information available regarding this question."`;

    const userPrompt = `Retrieved Context Items:\n${contextFormatted}\n\nUser Question: "${query}"`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract cited item IDs from answer
    const citedIds = contextItems
      .filter(item => answer.includes(item.id))
      .map(item => item.id);

    return {
      answer,
      citedIds: citedIds.length > 0 ? citedIds : contextItems.slice(0, 3).map(i => i.id),
    };
  } catch (err) {
    console.warn('⚠️ Anthropic API call failed for Ask LOOP, returning context summary fallback:', err);
    return {
      answer: `Based on retrieved feedback: ${contextItems[0].content} [${contextItems[0].id}]`,
      citedIds: [contextItems[0].id],
    };
  }
}

/**
 * 3. Voice of Customer (VoC) Report Narrative Generator (AI4)
 */
export async function generateVoCReport(
  periodStart: Date,
  periodEnd: Date,
  stats: {
    totalFeedback: number;
    sentimentCounts: Record<string, number>;
    topThemes: Array<{ name: string; count: number }>;
    sampleFeedback: Array<{ id: string; content: string; sentiment: string }>;
  }
): Promise<ReportResult> {
  if (!anthropic) {
    return {
      title: `Executive VoC Report (${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]})`,
      summary: `During this period, a total of ${stats.totalFeedback} customer feedback entries were processed. Positive feedback represents ${stats.sentimentCounts.POSITIVE || 0} items, Neutral represents ${stats.sentimentCounts.NEUTRAL || 0} items, and Negative represents ${stats.sentimentCounts.NEGATIVE || 0} items.`,
      keyThemes: stats.topThemes.map(t => `${t.name} (${t.count} items)`),
      actionableInsights: [
        'Prioritize resolving performance and speed bottlenecks raised by enterprise accounts.',
        'Expand third-party integration capabilities (e.g. Slack/Webhooks) requested in recent tickets.',
        'Address billing inquiry response times to improve customer satisfaction scores.',
      ],
    };
  }

  try {
    const prompt = `Write a professional Voice of Customer (VoC) executive report based on the following pre-computed metrics. Output ONLY a valid JSON object with no Markdown wrappers.

Metrics:
- Total Feedback Items: ${stats.totalFeedback}
- Sentiment Breakdown: ${JSON.stringify(stats.sentimentCounts)}
- Top Themes: ${JSON.stringify(stats.topThemes)}
- Sample Items: ${JSON.stringify(stats.sampleFeedback)}

JSON Output Schema:
{
  "title": "Report title with date range",
  "summary": "Executive summary paragraph summarizing key sentiment trends and volume",
  "keyThemes": ["array of 3-5 key theme summaries with metrics"],
  "actionableInsights": ["array of 3-5 specific actionable product recommendations"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleanJson = text.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
    const parsed = JSON.parse(cleanJson);

    return reportResultSchema.parse(parsed);
  } catch (err) {
    console.warn('⚠️ Anthropic API call failed for VoC report, using analytical fallback:', err);
    return {
      title: `VoC Summary (${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]})`,
      summary: `Processed ${stats.totalFeedback} feedback items with ${stats.sentimentCounts.POSITIVE || 0} positive and ${stats.sentimentCounts.NEGATIVE || 0} negative reports.`,
      keyThemes: stats.topThemes.map(t => `${t.name}: ${t.count} items`),
      actionableInsights: [
        'Address top customer issues identified in performance and billing themes.',
        'Investigate feature requests with highest repeat volume.',
      ],
    };
  }
}
