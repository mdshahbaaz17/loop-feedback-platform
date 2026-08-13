import './index';

async function runDay6Tests() {
  console.log('📊 Starting Day 6 Backend Analytics & Sanitization Verification Suite...\n');

  // Wait 1.5 seconds for Express server to bind cleanly
  await new Promise((r) => setTimeout(r, 1500));
  const baseUrl = 'http://localhost:4000';

  try {
    // 1. Login as Admin user to obtain JWT
    console.log('1️⃣ Authenticating Admin User...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@acme.com', password: 'password123' }),
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const { token } = await loginRes.json();
    console.log('   Admin JWT Token obtained successfully.');

    // 2. Test GET /api/analytics/overview
    console.log('\n2️⃣ Testing GET /api/analytics/overview...');
    const overviewRes = await fetch(`${baseUrl}/api/analytics/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`   Overview status: ${overviewRes.status}`);
    const overviewData = await overviewRes.json();
    console.log(`   Total Feedback Count: ${overviewData.totalFeedback}`);
    console.log(`   Positive Ratio: ${overviewData.sentimentBreakdown?.positiveRatio}%`);
    console.log(`   Average Sentiment Score: ${overviewData.averageSentimentScore}`);
    console.log(`   Total Active Themes: ${overviewData.totalThemes}`);

    if (overviewRes.status !== 200 || typeof overviewData.totalFeedback !== 'number') {
      throw new Error('Analytics overview test failed!');
    }

    // 3. Test GET /api/analytics/sentiment-trend
    console.log('\n3️⃣ Testing GET /api/analytics/sentiment-trend...');
    const trendRes = await fetch(`${baseUrl}/api/analytics/sentiment-trend?days=30`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`   Sentiment Trend status: ${trendRes.status}`);
    const trendData = await trendRes.json();
    console.log(`   Time-Series Data Points Count: ${trendData.trend?.length || 0}`);

    if (trendRes.status !== 200 || !Array.isArray(trendData.trend)) {
      throw new Error('Analytics sentiment trend test failed!');
    }

    // 4. Test GET /api/analytics/channels
    console.log('\n4️⃣ Testing GET /api/analytics/channels...');
    const channelRes = await fetch(`${baseUrl}/api/analytics/channels`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`   Channel Breakdown status: ${channelRes.status}`);
    const channelData = await channelRes.json();
    console.log(`   Channels Count: ${channelData.breakdown?.length || 0}`);

    if (channelRes.status !== 200 || !Array.isArray(channelData.breakdown)) {
      throw new Error('Analytics channel breakdown test failed!');
    }

    // 5. Test Input XSS Sanitization Middleware
    console.log('\n5️⃣ Testing Input XSS Sanitization Middleware...');
    const xssPayload = 'Great service <script>alert("hacked")</script> from mobile app.';
    const createRes = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: xssPayload,
        source: 'Security Test',
        channel: 'TEST',
      }),
    });

    console.log(`   Create Feedback status: ${createRes.status}`);
    const createdItem = await createRes.json();
    console.log(`   Submitted Content: "${xssPayload}"`);
    console.log(`   Sanitized Stored Content: "${createdItem.content}"`);

    if (createdItem.content.includes('<script>')) {
      throw new Error('XSS Sanitization failed! Malicious script tag was not stripped.');
    }

    console.log('\n✨ ALL DAY 6 BACKEND ANALYTICS & SANITIZATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Day 6 Test Failed:', err.message);
    process.exit(1);
  }
}

runDay6Tests();
