import { User, Feedback, FeedbackLoop, Analytics } from './types';
import { mockUsers, mockFeedback, mockLoops, mockAnalytics } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// This is a clean API abstraction layer.
// Currently it uses mock data as the backend endpoints are not fully implemented.
// Once ready, replace the mock returns with actual fetch calls using API_BASE_URL.

export const api = {
  feedback: {
    list: async (): Promise<Feedback[]> => {
      // Example of future real implementation:
      // const res = await fetch(\`\${API_BASE_URL}/feedback\`);
      // if (!res.ok) throw new Error('Failed to fetch feedback');
      // return res.json();
      await delay(500);
      return mockFeedback;
    },
    get: async (id: string): Promise<Feedback | undefined> => {
      await delay(300);
      return mockFeedback.find(f => f.id === id);
    },
    create: async (data: Partial<Feedback>): Promise<Feedback> => {
      await delay(500);
      const newFeedback = { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Feedback;
      mockFeedback.push(newFeedback);
      return newFeedback;
    }
  },
  loops: {
    list: async (): Promise<FeedbackLoop[]> => {
      await delay(500);
      return mockLoops;
    },
    get: async (id: string): Promise<FeedbackLoop | undefined> => {
      await delay(300);
      return mockLoops.find(l => l.id === id);
    }
  },
  analytics: {
    get: async (): Promise<Analytics> => {
      await delay(600);
      return mockAnalytics;
    }
  },
  team: {
    list: async (): Promise<User[]> => {
      await delay(400);
      return mockUsers;
    }
  }
};
