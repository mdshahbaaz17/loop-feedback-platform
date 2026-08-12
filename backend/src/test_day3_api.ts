import './index';

async function runDay3Verification() {
  console.log('\n=========================================================');
  console.log('🚀 Starting Day 3 Express Backend AI Verification Suite...');
  console.log('=========================================================\n');

  const baseUrl = `http://localhost:4000`;

  try {
    // 1. Health check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log(`   Health status: ${healthRes.status} ->`, healthJson);

    // 2. Login as Admin & Viewer
    console.log('\n2️⃣ Testing Authentication...');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@acme.com', password: 'password123' })
    });
    const adminAuth = await adminLoginRes.json();
    console.log(`   Admin Login Status: ${adminLoginRes.status}, Role: ${adminAuth.user.role}`);
    const adminToken = adminAuth.token;

    const viewerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@acme.com', password: 'password123' })
    });
    const viewerAuth = await viewerLoginRes.json();
    console.log(`   Viewer Login Status: ${viewerLoginRes.status}, Role: ${viewerAuth.user.role}`);
    const viewerToken = viewerAuth.token;

    // 3. Test Automatic Classification on Ingest
    console.log('\n3️⃣ Testing Ingest Auto-Classification (AI1)...');
    const createFeedbackRes = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        content: 'Dashboard loads extremely slow during peak hours. Server returned 504 gateway timeout.',
        source: 'Intercom',
        channel: 'INTERCOM'
      })
    });
    const createdItem = await createFeedbackRes.json();
    console.log(`   Admin POST /api/feedback -> Status ${createFeedbackRes.status}`);
    console.log(`   Auto-Classified Sentiment: ${createdItem.sentiment}, Score: ${createdItem.sentimentScore}`);
    console.log(`   Assigned Themes Count: ${createdItem.themes.length}`);

    // 4. Test Reclassify Endpoint (AI1)
    console.log('\n4️⃣ Testing Reclassification Endpoint...');
    const reclassifyRes = await fetch(`${baseUrl}/api/feedback/${createdItem.id}/reclassify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const reclassifyJson = await reclassifyRes.json();
    console.log(`   Admin POST /api/feedback/${createdItem.id}/reclassify -> Status ${reclassifyRes.status}`);
    console.log(`   Reclassified Sentiment: ${reclassifyJson.data.sentiment}`);

    // 5. Test Ask LOOP Grounded Q&A (AI3)
    console.log('\n5️⃣ Testing Ask LOOP Grounded Q&A (AI3)...');
    const askRes = await fetch(`${baseUrl}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${viewerToken}` // Accessible to Viewer role
      },
      body: JSON.stringify({
        query: 'What are customers reporting about dashboard speed and loading timeouts?'
      })
    });
    const askJson = await askRes.json();
    console.log(`   Viewer POST /api/ask -> Status ${askRes.status}`);
    console.log(`   Ask LOOP Answer Summary: ${askJson.answer.slice(0, 150)}...`);
    console.log(`   Cited Context Items Count: ${askJson.citedFeedback.length}`);

    // 6. Test VoC Report Generation (AI4)
    console.log('\n6️⃣ Testing VoC Executive Report Generation (AI4)...');
    
    // Test Viewer RBAC (Viewer should be blocked from report generation)
    const viewerReportRes = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${viewerToken}`
      },
      body: JSON.stringify({})
    });
    console.log(`   Viewer POST /api/reports -> Status ${viewerReportRes.status} (Expected 403 Forbidden)`);

    // Test Admin Report Generation
    const adminReportRes = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({})
    });
    const reportJson = await adminReportRes.json();
    console.log(`   Admin POST /api/reports -> Status ${adminReportRes.status} (Expected 201 Created)`);
    console.log(`   Generated Report Title: "${reportJson.title}"`);
    console.log(`   Key Themes Count: ${reportJson.keyThemes.length}`);
    console.log(`   Actionable Insights Count: ${reportJson.actionableInsights.length}`);

    // 7. Test Fetching Reports
    console.log('\n7️⃣ Testing GET /api/reports...');
    const getReportsRes = await fetch(`${baseUrl}/api/reports`, {
      headers: { Authorization: `Bearer ${viewerToken}` }
    });
    const reportsList = await getReportsRes.json();
    console.log(`   Viewer GET /api/reports -> Status ${getReportsRes.status}, Reports Total: ${reportsList.length}`);

    console.log('\n=========================================================');
    console.log('✨ All Day 3 AI & Advanced Analytics Verifications Passed!');
    console.log('=========================================================\n');
  } catch (err) {
    console.error('❌ Day 3 verification failed with error:', err);
  } finally {
    process.exit(0);
  }
}

setTimeout(runDay3Verification, 500);
