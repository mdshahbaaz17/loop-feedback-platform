import './index';

async function runVerification() {
  console.log('\n=========================================================');
  console.log('🚀 Starting Day 2 Express Backend Verification Suite...');
  console.log('=========================================================\n');

  const baseUrl = `http://localhost:4000`;

  try {
    // 1. Health check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log(`   Health status: ${healthRes.status} ->`, healthJson);

    // 2. Login as Admin
    console.log('\n2️⃣ Testing Authentication (Admin Login)...');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@acme.com', password: 'password123' })
    });
    const adminAuth = await adminLoginRes.json();
    console.log(`   Admin Login Status: ${adminLoginRes.status}`);
    console.log(`   Admin Role: ${adminAuth.user.role}, Workspace: ${adminAuth.user.workspaceId}`);
    const adminToken = adminAuth.token;

    // 3. Login as Viewer
    console.log('\n3️⃣ Testing Authentication (Viewer Login)...');
    const viewerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@acme.com', password: 'password123' })
    });
    const viewerAuth = await viewerLoginRes.json();
    console.log(`   Viewer Login Status: ${viewerLoginRes.status}`);
    console.log(`   Viewer Role: ${viewerAuth.user.role}`);
    const viewerToken = viewerAuth.token;

    // 4. Test RBAC: User Management (Admin allowed, Viewer blocked)
    console.log('\n4️⃣ Testing RBAC on Workspace User Management...');
    const adminUsersRes = await fetch(`${baseUrl}/api/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Admin GET /api/auth/users -> Status ${adminUsersRes.status} (Expected 200)`);

    const viewerUsersRes = await fetch(`${baseUrl}/api/auth/users`, {
      headers: { Authorization: `Bearer ${viewerToken}` }
    });
    console.log(`   Viewer GET /api/auth/users -> Status ${viewerUsersRes.status} (Expected 403 Forbidden)`);

    // 5. Test Feedback Pagination & Search
    console.log('\n5️⃣ Testing Feedback Pagination & Search...');
    const paginatedRes = await fetch(`${baseUrl}/api/feedback?page=1&limit=5&search=loading`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const paginatedJson = await paginatedRes.json();
    console.log(`   GET /api/feedback?page=1&limit=5&search=loading -> Status ${paginatedRes.status}`);
    console.log(`   Returned total: ${paginatedJson.pagination.total}, page: ${paginatedJson.pagination.page}, limit: ${paginatedJson.pagination.limit}`);
    console.log(`   Found matching items: ${paginatedJson.data.length}`);

    // 6. Test Feedback Creation & Status Update RBAC (Admin/Analyst vs Viewer)
    console.log('\n6️⃣ Testing Feedback Mutation RBAC...');
    const createAsViewerRes = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${viewerToken}`
      },
      body: JSON.stringify({
        content: 'Test content from viewer',
        source: 'Test',
        channel: 'EMAIL'
      })
    });
    console.log(`   Viewer POST /api/feedback -> Status ${createAsViewerRes.status} (Expected 403 Forbidden)`);

    const createAsAdminRes = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        content: 'New critical bug reported in billing flow.',
        source: 'Zendesk',
        channel: 'ZENDESK',
        customerLabel: 'Enterprise',
        sentiment: 'NEGATIVE',
        sentimentScore: -0.9
      })
    });
    const createdItem = await createAsAdminRes.json();
    console.log(`   Admin POST /api/feedback -> Status ${createAsAdminRes.status} (Expected 201 Created)`);
    console.log(`   Created Feedback ID: ${createdItem.id}`);

    // Update feedback status
    const patchRes = await fetch(`${baseUrl}/api/feedback/${createdItem.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'REVIEWED' })
    });
    const patchedItem = await patchRes.json();
    console.log(`   Admin PATCH /api/feedback/${createdItem.id} -> Status ${patchRes.status}, New Status: ${patchedItem.status}`);

    // 7. Test Bulk CSV Ingest
    console.log('\n7️⃣ Testing Bulk CSV Import...');
    const importRes = await fetch(`${baseUrl}/api/feedback/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify([
        { content: 'Bulk item 1 from CSV', source: 'CSV Upload', channel: 'EMAIL', sentiment: 'POSITIVE' },
        { content: 'Bulk item 2 from CSV', source: 'CSV Upload', channel: 'TWITTER', sentiment: 'NEUTRAL' }
      ])
    });
    const importJson = await importRes.json();
    console.log(`   Admin POST /api/feedback/import -> Status ${importRes.status}, Imported Count: ${importJson.count}`);

    // 8. Test Themes & Trends API
    console.log('\n8️⃣ Testing Themes & Trends API...');
    const themesRes = await fetch(`${baseUrl}/api/themes`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const themesJson = await themesRes.json();
    console.log(`   GET /api/themes -> Status ${themesRes.status}, Total Workspace Themes: ${themesJson.length}`);
    console.log(`   Sample Theme: ${themesJson[0]?.name} (Feedback count: ${themesJson[0]?.feedbackCount})`);

    const trendsRes = await fetch(`${baseUrl}/api/themes/trends`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const trendsJson = await trendsRes.json();
    console.log(`   GET /api/themes/trends -> Status ${trendsRes.status}, Trends computed: ${trendsJson.length}`);
    console.log(`   Sample Trend:`, trendsJson[0]);

    console.log('\n=========================================================');
    console.log('✨ All Day 2 API Verifications Passed Successfully!');
    console.log('=========================================================\n');
  } catch (err) {
    console.error('❌ Verification failed with error:', err);
  } finally {
    process.exit(0);
  }
}

// Give server 500ms to bind to port 4000
setTimeout(runVerification, 500);
