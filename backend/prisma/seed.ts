import { Role, Sentiment, FeedbackStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';


const FEEDBACK_SAMPLES = [
  {
    content: "The dashboard loading speed has significantly slowed down after the recent update. Takes over 5 seconds to show stats.",
    source: "Intercom",
    channel: "INTERCOM",
    customerLabel: "Enterprise",
    sentiment: Sentiment.NEGATIVE,
    sentimentScore: -0.8,
    status: FeedbackStatus.NEW,
    themeIndex: 3, // Performance & Speed
    daysAgo: 1,
  },
  {
    content: "Would love to see an integration with Slack for real-time notifications on critical issues.",
    source: "Zendesk",
    channel: "ZENDESK",
    customerLabel: "SMB",
    sentiment: Sentiment.NEUTRAL,
    sentimentScore: 0.2,
    status: FeedbackStatus.REVIEWED,
    themeIndex: 5, // Integrations
    daysAgo: 2,
  },
  {
    content: "The new UI is super clean and intuitive! Our team adopted it within minutes.",
    source: "Twitter",
    channel: "TWITTER",
    customerLabel: "VIP",
    sentiment: Sentiment.POSITIVE,
    sentimentScore: 0.9,
    status: FeedbackStatus.RESOLVED,
    themeIndex: 0, // UI/UX & Navigation
    daysAgo: 2,
  },
  {
    content: "We were double-billed for our monthly subscription this cycle. Please issue a refund.",
    source: "Email",
    channel: "EMAIL",
    customerLabel: "Enterprise",
    sentiment: Sentiment.NEGATIVE,
    sentimentScore: -0.9,
    status: FeedbackStatus.NEW,
    themeIndex: 2, // Billing & Pricing
    daysAgo: 3,
  },
  {
    content: "Customer support responded in less than 5 minutes and resolved my problem right away. Fantastic service!",
    source: "App Store",
    channel: "APP_STORE",
    customerLabel: "SMB",
    sentiment: Sentiment.POSITIVE,
    sentimentScore: 0.95,
    status: FeedbackStatus.RESOLVED,
    themeIndex: 4, // Customer Support
    daysAgo: 4,
  },
  {
    content: "Can we export reports directly as CSV and PDF? Current options are too limited.",
    source: "Call Transcript",
    channel: "CALL_TRANSCRIPT",
    customerLabel: "Enterprise",
    sentiment: Sentiment.NEUTRAL,
    sentimentScore: 0.1,
    status: FeedbackStatus.NEW,
    themeIndex: 1, // Feature Requests
    daysAgo: 5,
  },
  {
    content: "Navigation menu on mobile browsers overlaps with header text.",
    source: "App Store",
    channel: "APP_STORE",
    customerLabel: "Free Tier",
    sentiment: Sentiment.NEGATIVE,
    sentimentScore: -0.6,
    status: FeedbackStatus.REVIEWED,
    themeIndex: 0, // UI/UX & Navigation
    daysAgo: 6,
  },
  {
    content: "API rate limits are too restrictive for our volume. We need a higher quota tier.",
    source: "Email",
    channel: "EMAIL",
    customerLabel: "Enterprise",
    sentiment: Sentiment.NEUTRAL,
    sentimentScore: -0.2,
    status: FeedbackStatus.NEW,
    themeIndex: 5, // Integrations
    daysAgo: 7,
  },
  {
    content: "Love the automated reporting feature! Saves our team hours every week.",
    source: "Twitter",
    channel: "TWITTER",
    customerLabel: "SMB",
    sentiment: Sentiment.POSITIVE,
    sentimentScore: 0.85,
    status: FeedbackStatus.RESOLVED,
    themeIndex: 1, // Feature Requests
    daysAgo: 8,
  },
  {
    content: "Dark mode option is desperately needed. The bright white background is tiring on night shifts.",
    source: "Intercom",
    channel: "INTERCOM",
    customerLabel: "VIP",
    sentiment: Sentiment.NEUTRAL,
    sentimentScore: 0.0,
    status: FeedbackStatus.NEW,
    themeIndex: 0, // UI/UX & Navigation
    daysAgo: 9,
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create or retrieve demo Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'acme-corp-demo-workspace' },
    update: {},
    create: {
      id: 'acme-corp-demo-workspace',
      name: 'Acme Corp',
    },
  });

  console.log(`✅ Workspace ready: ${workspace.name} (${workspace.id})`);

  // 2. Create standard users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    { email: 'admin@acme.com', role: Role.ADMIN },
    { email: 'analyst@acme.com', role: Role.ANALYST },
    { email: 'viewer@acme.com', role: Role.VIEWER },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, workspaceId: workspace.id },
      create: {
        email: u.email,
        password: hashedPassword,
        role: u.role,
        workspaceId: workspace.id,
      },
    });
    console.log(`👤 User created/updated: ${user.email} [${user.role}]`);
  }

  // 3. Create Themes
  const themesData = [
    { name: 'UI/UX & Navigation', description: 'User interface design, menu navigation, and layout feedback' },
    { name: 'Feature Requests', description: 'Customer requests for new capabilities and tools' },
    { name: 'Billing & Pricing', description: 'Payment processing, invoices, and tier pricing inquiries' },
    { name: 'Performance & Speed', description: 'Application responsiveness, latency, and loading bottlenecks' },
    { name: 'Customer Support', description: 'Support agent response quality, speed, and helpfulness' },
    { name: 'Integrations', description: 'Third-party integrations, webhook connections, and API capabilities' },
  ];

  const createdThemes = [];
  for (const t of themesData) {
    const theme = await prisma.theme.upsert({
      where: {
        workspaceId_name: {
          workspaceId: workspace.id,
          name: t.name,
        },
      },
      update: { description: t.description },
      create: {
        name: t.name,
        description: t.description,
        workspaceId: workspace.id,
      },
    });
    createdThemes.push(theme);
  }
  console.log(`🏷️ Created ${createdThemes.length} workspace themes.`);

  // 4. Populate 120+ Feedback items with historical timestamps
  console.log('📦 Seeding 120+ realistic feedback items...');
  const now = new Date();

  // Create 12 iterations of the 10 core sample templates with timestamp variance
  let count = 0;
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < FEEDBACK_SAMPLES.length; j++) {
      const sample = FEEDBACK_SAMPLES[j];
      const daysOffset = sample.daysAgo + i * 2;
      const createdAtDate = new Date(now.getTime() - daysOffset * 24 * 60 * 60 * 1000);

      const targetTheme = createdThemes[sample.themeIndex % createdThemes.length];

      const feedback = await prisma.feedback.create({
        data: {
          content: `${sample.content} (Batch #${i + 1})`,
          source: sample.source,
          channel: sample.channel,
          customerLabel: sample.customerLabel,
          sentiment: sample.sentiment,
          sentimentScore: sample.sentimentScore,
          status: sample.status,
          workspaceId: workspace.id,
          createdAt: createdAtDate,
          themes: {
            create: {
              themeId: targetTheme.id,
              confidence: 0.85 + (Math.random() * 0.14),
            },
          },
        },
      });
      count++;
    }
  }

  console.log(`✅ Successfully seeded ${count} feedback items.`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
