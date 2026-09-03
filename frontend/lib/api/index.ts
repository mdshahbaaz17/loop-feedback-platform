import { User, Feedback, FeedbackLoop, Analytics, AskLoopResponse, VoCReport } from './types';
import { mockUsers, mockFeedback, mockLoops, mockAnalytics } from './mockData';
import { getToken } from '../auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function normalizeFeedback(item: any): Feedback {
  return {
    ...item,
    content: item.content || item.description || '',
    title: item.title || (item.content ? item.content.slice(0, 60) + (item.content.length > 60 ? '...' : '') : 'Feedback Item'),
    description: item.description || item.content || '',
    priority: item.priority || (item.sentiment === 'NEGATIVE' ? 'HIGH' : item.sentiment === 'NEUTRAL' ? 'MEDIUM' : 'LOW'),
    category: item.category || (item.themes && item.themes[0]?.theme?.name) || item.channel || 'General',
    tags: item.tags || (item.themes ? item.themes.map((t: any) => t.theme?.name).filter(Boolean) : []),
    status: item.status || 'NEW',
    source: item.source || 'Direct',
    channel: item.channel || 'EMAIL',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

export const api = {
  feedback: {
    list: async (params?: { search?: string; sentiment?: string; status?: string; channel?: string; page?: number; limit?: number }): Promise<Feedback[]> => {
      try {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.sentiment && params.sentiment !== 'ALL') query.append('sentiment', params.sentiment);
        if (params?.status && params.status !== 'ALL') query.append('status', params.status);
        if (params?.channel && params.channel !== 'ALL') query.append('channel', params.channel);
        if (params?.page) query.append('page', String(params.page));
        if (params?.limit) query.append('limit', String(params.limit || 50));

        const res = await fetch(`${API_BASE_URL}/feedback?${query.toString()}`, {
          headers: getHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data || []);
        return items.map(normalizeFeedback);
      } catch (err) {
        console.warn('Backend feedback fetch failed, using local demo data:', err);
        return mockFeedback.map(normalizeFeedback);
      }
    },

    get: async (id: string): Promise<Feedback | undefined> => {
      try {
        const res = await fetch(`${API_BASE_URL}/feedback/${id}`, {
          headers: getHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return normalizeFeedback(data);
      } catch {
        const found = mockFeedback.find(f => f.id === id);
        return found ? normalizeFeedback(found) : undefined;
      }
    },

    create: async (data: { content: string; source: string; channel?: string; customerLabel?: string; sentiment?: string }): Promise<Feedback> => {
      try {
        const res = await fetch(`${API_BASE_URL}/feedback`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create feedback');
        }
        const created = await res.json();
        return normalizeFeedback(created);
      } catch (err: any) {
        console.warn('Backend feedback creation fallback:', err);
        const localItem: Feedback = normalizeFeedback({
          id: 'local-' + Date.now(),
          content: data.content,
          source: data.source || 'Web App',
          channel: data.channel || 'EMAIL',
          customerLabel: data.customerLabel || 'User',
          sentiment: (data.sentiment as any) || 'NEUTRAL',
          sentimentScore: 0,
          status: 'NEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        mockFeedback.unshift(localItem);
        return localItem;
      }
    },

    update: async (id: string, data: Partial<Feedback>): Promise<Feedback> => {
      try {
        const res = await fetch(`${API_BASE_URL}/feedback/${id}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update');
        const updated = await res.json();
        return normalizeFeedback(updated);
      } catch {
        const idx = mockFeedback.findIndex(f => f.id === id);
        if (idx !== -1) {
          mockFeedback[idx] = { ...mockFeedback[idx], ...data } as any;
          return normalizeFeedback(mockFeedback[idx]);
        }
        throw new Error('Item not found');
      }
    },

    reclassify: async (id: string): Promise<any> => {
      const res = await fetch(`${API_BASE_URL}/feedback/${id}/reclassify`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Reclassification failed');
      return res.json();
    }
  },

  analytics: {
    get: async (): Promise<Analytics> => {
      try {
        const [overviewRes, trendRes, channelRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/overview`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/analytics/sentiment-trend?days=30`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/analytics/channels`, { headers: getHeaders() })
        ]);

        if (!overviewRes.ok) throw new Error('Failed overview');

        const overview = await overviewRes.json();
        const trendData = trendRes.ok ? await trendRes.json() : { trend: [] };
        const channelData = channelRes.ok ? await channelRes.json() : { breakdown: [] };

        const feedbackVolumeOverTime = (trendData.trend || []).map((t: any) => ({
          date: t.date.slice(5),
          count: t.total,
          positive: t.positive,
          negative: t.negative,
          neutral: t.neutral,
        }));

        return {
          totalFeedback: overview.totalFeedback ?? 120,
          openFeedback: overview.sentimentBreakdown?.neutral ?? 35,
          inProgress: overview.sentimentBreakdown?.negative ?? 25,
          resolved: overview.sentimentBreakdown?.positive ?? 60,
          responseRate: 94,
          activeLoops: overview.totalThemes ?? 6,
          positiveRatio: overview.sentimentBreakdown?.positiveRatio ?? 50,
          neutralRatio: overview.sentimentBreakdown?.neutralRatio ?? 29,
          negativeRatio: overview.sentimentBreakdown?.negativeRatio ?? 21,
          averageSentimentScore: overview.averageSentimentScore ?? 0.32,
          totalThemes: overview.totalThemes ?? 6,
          sentimentBreakdown: overview.sentimentBreakdown,
          feedbackVolumeOverTime: feedbackVolumeOverTime.length > 0 ? feedbackVolumeOverTime : mockAnalytics.feedbackVolumeOverTime,
          feedbackByStatus: [
            { status: 'NEW', count: overview.sentimentBreakdown?.negative ?? 25 },
            { status: 'REVIEWED', count: overview.sentimentBreakdown?.neutral ?? 35 },
            { status: 'RESOLVED', count: overview.sentimentBreakdown?.positive ?? 60 },
          ],
          channels: channelData.breakdown || []
        };
      } catch (err) {
        console.warn('Analytics backend fetch failed, using realistic seeded demo data:', err);
        return {
          ...mockAnalytics,
          positiveRatio: 52,
          neutralRatio: 28,
          negativeRatio: 20,
          averageSentimentScore: 0.34,
          totalThemes: 6,
          sentimentBreakdown: {
            positive: 62,
            neutral: 34,
            negative: 24,
            positiveRatio: 51.7,
            neutralRatio: 28.3,
            negativeRatio: 20.0
          },
          channels: [
            { channel: 'INTERCOM', count: 38, averageSentimentScore: 0.42 },
            { channel: 'EMAIL', count: 32, averageSentimentScore: 0.15 },
            { channel: 'ZENDESK', count: 24, averageSentimentScore: 0.28 },
            { channel: 'TWITTER', count: 16, averageSentimentScore: 0.55 },
            { channel: 'APP_STORE', count: 10, averageSentimentScore: -0.10 }
          ]
        };
      }
    },

    getChannels: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/channels`, { headers: getHeaders() });
        if (!res.ok) throw new Error();
        return (await res.json()).breakdown;
      } catch {
        return [];
      }
    }
  },

  ask: {
    query: async (query: string): Promise<AskLoopResponse> => {
      try {
        const res = await fetch(`${API_BASE_URL}/ask`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ query }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Ask LOOP request failed');
        }
        const data = await res.json();
        return {
          answer: data.answer,
          citedFeedback: (data.citedFeedback || []).map(normalizeFeedback),
          totalRetrieved: data.totalRetrieved || 0,
        };
      } catch (err: any) {
        console.warn('Ask LOOP backend fallback:', err);
        return {
          answer: `Based on customer feedback in your workspace: Customers frequently highlight high satisfaction with the redesigned dashboard UI and fast support responses. Key areas requesting improvement include export timeouts on large datasets (>50MB), occasional billing discrepancy inquiries, and requests for Slack integrations.`,
          citedFeedback: mockFeedback.slice(0, 3).map(normalizeFeedback),
          totalRetrieved: 3
        };
      }
    }
  },

  reports: {
    generate: async (periodStart: string, periodEnd: string, title?: string): Promise<VoCReport> => {
      const res = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ periodStart, periodEnd, title }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      return res.json();
    },

    list: async (): Promise<VoCReport[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/reports`, { headers: getHeaders() });
        if (!res.ok) throw new Error();
        return res.json();
      } catch {
        return [];
      }
    }
  },

  themes: {
    list: async (): Promise<{ id: string; name: string; description?: string; feedbackCount?: number }[]> => {
      try {
        const res = await fetch(`${API_BASE_URL}/themes`, { headers: getHeaders() });
        if (!res.ok) throw new Error();
        return res.json();
      } catch {
        return [
          { id: 't1', name: 'UI/UX & Navigation', description: 'User interface layout and ease of use', feedbackCount: 28 },
          { id: 't2', name: 'Performance & Speed', description: 'System latency and load times', feedbackCount: 22 },
          { id: 't3', name: 'Billing & Pricing', description: 'Invoicing and plan inquiries', feedbackCount: 18 },
          { id: 't4', name: 'Integrations', description: 'Third party platform connectors', feedbackCount: 15 },
          { id: 't5', name: 'Customer Support', description: 'Support turnaround and assistance', feedbackCount: 21 },
          { id: 't6', name: 'Feature Requests', description: 'New capability suggestions', feedbackCount: 16 }
        ];
      }
    }
  },

  loops: {
    list: async (): Promise<FeedbackLoop[]> => {
      return mockLoops;
    },
    get: async (id: string): Promise<FeedbackLoop | undefined> => {
      return mockLoops.find(l => l.id === id);
    }
  },

  team: {
    list: async (): Promise<User[]> => {
      return [
        { id: '1', name: 'Admin User', email: 'admin@acme.com', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=1' },
        { id: '2', name: 'Data Analyst', email: 'analyst@acme.com', role: 'ANALYST', avatar: 'https://i.pravatar.cc/150?u=2' },
        { id: '3', name: 'Platform Viewer', email: 'viewer@acme.com', role: 'VIEWER', avatar: 'https://i.pravatar.cc/150?u=3' },
      ];
    }
  }
};
