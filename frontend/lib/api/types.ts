export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER' | 'MANAGER' | 'MEMBER';
  workspaceId?: string;
  avatar?: string;
}

export interface FeedbackThemeItem {
  themeId?: string;
  confidence?: number;
  theme: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface Feedback {
  id: string;
  content: string;
  title?: string;
  description?: string;
  source: string;
  channel: string;
  customerLabel?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentScore?: number;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED' | 'IN_PROGRESS' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string;
  tags?: string[];
  themes?: FeedbackThemeItem[];
  authorId?: string;
  assigneeId?: string;
  loopId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackLoop {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'CLOSED';
  feedbackIds: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalFeedback: number;
  openFeedback: number;
  inProgress: number;
  resolved: number;
  responseRate: number;
  activeLoops: number;
  positiveRatio?: number;
  neutralRatio?: number;
  negativeRatio?: number;
  averageSentimentScore?: number;
  totalThemes?: number;
  sentimentBreakdown?: {
    positive: number;
    neutral: number;
    negative: number;
    positiveRatio: number;
    neutralRatio: number;
    negativeRatio: number;
  };
  feedbackVolumeOverTime: { date: string; count: number; positive?: number; negative?: number; neutral?: number }[];
  feedbackByStatus: { status: string; count: number }[];
  channels?: { channel: string; count: number; averageSentimentScore: number }[];
}

export interface AskLoopResponse {
  answer: string;
  citedFeedback: Feedback[];
  totalRetrieved: number;
}

export interface VoCReport {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  keyThemes: string;
  actionableInsights: string;
  createdAt: string;
}
