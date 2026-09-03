import { User, Feedback, FeedbackLoop, Analytics } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', role: 'MANAGER', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'MEMBER', avatar: 'https://i.pravatar.cc/150?u=3' },
];

export const mockLoops: FeedbackLoop[] = [
  { id: 'l1', name: 'Q3 Product Redesign', description: 'Feedback loop for the upcoming dashboard redesign.', status: 'ACTIVE', feedbackIds: ['f1', 'f2'], ownerId: '1', createdAt: new Date(Date.now() - 1000000000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'l2', name: 'Mobile App Beta', description: 'Collecting issues for the iOS beta release.', status: 'ACTIVE', feedbackIds: ['f3'], ownerId: '2', createdAt: new Date(Date.now() - 2000000000).toISOString(), updatedAt: new Date().toISOString() },
];

export const mockFeedback: Feedback[] = [
  {
    id: 'f1',
    title: 'Navigation is confusing',
    description: 'The new sidebar makes it hard to find settings.',
    content: 'The new sidebar makes it hard to find settings. It requires too many clicks to reach workspace configuration.',
    source: 'Intercom',
    channel: 'INTERCOM',
    customerLabel: 'SMB',
    sentiment: 'NEGATIVE',
    sentimentScore: -0.6,
    authorId: '3',
    assigneeId: '1',
    status: 'NEW',
    priority: 'HIGH',
    category: 'UI/UX',
    loopId: 'l1',
    tags: ['sidebar', 'navigation'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'f2',
    title: 'Dark mode contrast issues',
    description: 'Text is hard to read on the secondary background in dark mode.',
    content: 'Text is hard to read on the secondary background in dark mode. Please improve the foreground contrast ratio.',
    source: 'Twitter',
    channel: 'TWITTER',
    customerLabel: 'Enterprise',
    sentiment: 'NEUTRAL',
    sentimentScore: 0.1,
    authorId: '2',
    assigneeId: '2',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'Accessibility',
    loopId: 'l1',
    tags: ['darkmode', 'design'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'f3',
    title: 'App crashes on launch',
    description: 'The mobile app crashes immediately after the splash screen on iOS 17.',
    content: 'The mobile app crashes immediately after the splash screen on iOS 17. Hotfix needed promptly.',
    source: 'App Store',
    channel: 'APP_STORE',
    customerLabel: 'Free Tier',
    sentiment: 'NEGATIVE',
    sentimentScore: -0.9,
    authorId: '3',
    assigneeId: '1',
    status: 'RESOLVED',
    priority: 'HIGH',
    category: 'Bug',
    loopId: 'l2',
    tags: ['ios', 'crash'],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date().toISOString()
  },
];

export const mockAnalytics: Analytics = {
  totalFeedback: 125,
  openFeedback: 45,
  inProgress: 20,
  resolved: 60,
  responseRate: 78,
  activeLoops: 12,
  feedbackVolumeOverTime: [
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 19 },
    { date: 'Wed', count: 15 },
    { date: 'Thu', count: 22 },
    { date: 'Fri', count: 30 },
    { date: 'Sat', count: 10 },
    { date: 'Sun', count: 17 },
  ],
  feedbackByStatus: [
    { status: 'NEW', count: 45 },
    { status: 'IN_PROGRESS', count: 20 },
    { status: 'RESOLVED', count: 60 },
  ]
};
