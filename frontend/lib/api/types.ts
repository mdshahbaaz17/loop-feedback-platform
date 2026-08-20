export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  avatar?: string;
}

export interface Feedback {
  id: string;
  title: string;
  description: string;
  authorId: string;
  assigneeId?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  loopId?: string;
  tags: string[];
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
  feedbackVolumeOverTime: { date: string; count: number }[];
  feedbackByStatus: { status: string; count: number }[];
}
