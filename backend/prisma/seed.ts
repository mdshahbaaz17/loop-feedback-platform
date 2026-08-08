import { PrismaClient, Role, Sentiment, FeedbackStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.feedbackTheme.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: { name: 'Demo Workspace' },
  });

  const password = await bcrypt.hash('password123', 10);
  await prisma.user.createMany({
    data: [
      { email: 'admin@example.com', password, role: Role.ADMIN, workspaceId: workspace.id },
      { email: 'analyst@example.com', password, role: Role.ANALYST, workspaceId: workspace.id },
      { email: 'viewer@example.com', password, role: Role.VIEWER, workspaceId: workspace.id },
    ],
  });

  const themes = await Promise.all([
    prisma.theme.create({ data: { name: 'UX/UI', description: 'User interface and experience issues' } }),
    prisma.theme.create({ data: { name: 'Performance', description: 'Speed and responsiveness' } }),
    prisma.theme.create({ data: { name: 'Pricing', description: 'Cost and billing related' } }),
    prisma.theme.create({ data: { name: 'Bugs', description: 'App errors and crashes' } }),
  ]);

  const feedbackList = [
    { source: 'Intercom', content: 'The new dashboard is extremely slow to load.', sentiment: Sentiment.NEGATIVE, status: FeedbackStatus.NEW },
    { source: 'Email', content: 'I love the new report feature, it saves me hours!', sentiment: Sentiment.POSITIVE, status: FeedbackStatus.REVIEWED },
    { source: 'Twitter', content: 'Why did the price go up again?', sentiment: Sentiment.NEGATIVE, status: FeedbackStatus.NEW },
    { source: 'App Store', content: 'App keeps crashing on startup since the last update.', sentiment: Sentiment.NEGATIVE, status: FeedbackStatus.NEW },
    { source: 'Survey', content: 'It would be nice to have dark mode.', sentiment: Sentiment.NEUTRAL, status: FeedbackStatus.NEW },
  ];

  for (const f of feedbackList) {
    const createdFeedback = await prisma.feedback.create({
      data: { ...f, workspaceId: workspace.id }
    });

    const numThemes = Math.floor(Math.random() * 2) + 1;
    const shuffledThemes = [...themes].sort(() => 0.5 - Math.random());
    const selectedThemes = shuffledThemes.slice(0, numThemes);

    for (const theme of selectedThemes) {
      await prisma.feedbackTheme.create({
        data: { feedbackId: createdFeedback.id, themeId: theme.id }
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
