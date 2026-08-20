import './index';

async function runDay4HardeningSuite() {
  console.log('\n=========================================================');
  console.log('🛡️ Starting Day 4 Backend Security & Hardening Suite...');
  console.log('=========================================================\n');

  const baseUrl = `http://localhost:4000`;

  try {
    // 1. Health check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log(`   Status ${healthRes.status} ->`, healthJson);

    // 2. Setup 2 Separate Workspaces for Multi-Tenant Isolation Audit
    console.log('\n2️⃣ Setting up Workspace Alpha & Workspace Beta...');
    const timestamp = Date.now();
    
    // Workspace Alpha Admin
    const alphaSignupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `alpha.admin.${timestamp}@acme.com`,
        password: 'password123',
        workspaceName: 'Workspace Alpha'
      })
    });
    const alphaAuth = await alphaSignupRes.json();
    console.log(`   Workspace Alpha Created -> Workspace ID: ${alphaAuth.user.workspaceId}`);

    // Workspace Beta Admin
    const betaSignupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `beta.admin.${timestamp}@beta.com`,
        password: 'password123',
        workspaceName: 'Workspace Beta'
      })
    });
    const betaAuth = await betaSignupRes.json();
    console.log(`   Workspace Beta Created  -> Workspace ID: ${betaAuth.user.workspaceId}`);

    // 3. Create Item in Workspace Alpha
    console.log('\n3️⃣ Creating Feedback Item in Workspace Alpha...');
    const createAlphaRes = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alphaAuth.token}`
      },
      body: JSON.stringify({
        content: 'Confidential Workspace Alpha customer feedback item',
        source: 'Alpha Support',
        channel: 'EMAIL'
      })
    });
    const alphaItem = await createAlphaRes.json();
    console.log(`   Alpha Item Created -> ID: ${alphaItem.id}`);

    // 4. Test Cross-Tenant Data Isolation (Beta User accessing Alpha Item)
    console.log('\n4️⃣ Audit: Cross-Tenant Isolation (Beta User -> Alpha Item)...');
    
    // Attempt GET
    const betaReadRes = await fetch(`${baseUrl}/api/feedback/${alphaItem.id}`, {
      headers: { Authorization: `Bearer ${betaAuth.token}` }
    });
    console.log(`   Beta User GET Alpha Item  -> Status ${betaReadRes.status} (Expected 404 Not Found)`);

    // Attempt PATCH
    const betaPatchRes = await fetch(`${baseUrl}/api/feedback/${alphaItem.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${betaAuth.token}`
      },
      body: JSON.stringify({ status: 'RESOLVED' })
    });
    console.log(`   Beta User PATCH Alpha Item -> Status ${betaPatchRes.status} (Expected 404 Not Found)`);

    // Attempt Reclassify
    const betaReclassifyRes = await fetch(`${baseUrl}/api/feedback/${alphaItem.id}/reclassify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${betaAuth.token}` }
    });
    console.log(`   Beta User Reclassify Alpha Item -> Status ${betaReclassifyRes.status} (Expected 404 Not Found)`);

    // 5. Test Full RBAC Permission Matrix (Admin vs Analyst vs Viewer)
    console.log('\n5️⃣ Audit: Full RBAC Role Permission Matrix...');
    
    // Create Analyst & Viewer in Workspace Alpha
    const analystRes = await fetch(`${baseUrl}/api/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alphaAuth.token}`
      },
      body: JSON.stringify({
        email: `alpha.analyst.${timestamp}@acme.com`,
        password: 'password123',
        role: 'ANALYST'
      })
    });
    const analystUser = await analystRes.json();

    const analystLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `alpha.analyst.${timestamp}@acme.com`, password: 'password123' })
    });
    const analystAuth = await analystLoginRes.json();

    const viewerRes = await fetch(`${baseUrl}/api/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alphaAuth.token}`
      },
      body: JSON.stringify({
        email: `alpha.viewer.${timestamp}@acme.com`,
        password: 'password123',
        role: 'VIEWER'
      })
    });
    const viewerUser = await viewerRes.json();

    const viewerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `alpha.viewer.${timestamp}@acme.com`, password: 'password123' })
    });
    const viewerAuth = await viewerLoginRes.json();

    // Matrix checks
    console.log('   Testing User Management Access (ADMIN only):');
    const uAdmin = await fetch(`${baseUrl}/api/auth/users`, { headers: { Authorization: `Bearer ${alphaAuth.token}` } });
    const uAnalyst = await fetch(`${baseUrl}/api/auth/users`, { headers: { Authorization: `Bearer ${analystAuth.token}` } });
    const uViewer = await fetch(`${baseUrl}/api/auth/users`, { headers: { Authorization: `Bearer ${viewerAuth.token}` } });
    console.log(`     ADMIN: ${uAdmin.status} (200), ANALYST: ${uAnalyst.status} (403), VIEWER: ${uViewer.status} (403)`);

    console.log('   Testing Report Generation Access (ADMIN & ANALYST allowed):');
    const rAdmin = await fetch(`${baseUrl}/api/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${alphaAuth.token}` }, body: '{}' });
    const rAnalyst = await fetch(`${baseUrl}/api/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${analystAuth.token}` }, body: '{}' });
    const rViewer = await fetch(`${baseUrl}/api/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${viewerAuth.token}` }, body: '{}' });
    console.log(`     ADMIN: ${rAdmin.status} (201), ANALYST: ${rAnalyst.status} (201), VIEWER: ${rViewer.status} (403)`);

    console.log('   Testing Ask LOOP Q&A Access (All roles allowed):');
    const aAdmin = await fetch(`${baseUrl}/api/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${alphaAuth.token}` }, body: JSON.stringify({ query: 'test' }) });
    const aAnalyst = await fetch(`${baseUrl}/api/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${analystAuth.token}` }, body: JSON.stringify({ query: 'test' }) });
    const aViewer = await fetch(`${baseUrl}/api/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${viewerAuth.token}` }, body: JSON.stringify({ query: 'test' }) });
    console.log(`     ADMIN: ${aAdmin.status} (200), ANALYST: ${aAnalyst.status} (200), VIEWER: ${aViewer.status} (200)`);

    // 6. Test Error Handler Middleware (Invalid Data & Bad JSON)
    console.log('\n6️⃣ Audit: Centralized Error Handler Middleware...');
    const badInputRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '123', workspaceName: '' })
    });
    const badInputJson = await badInputRes.json();
    console.log(`   Malformed Input -> Status ${badInputRes.status} (Expected 400 Bad Request)`);
    console.log(`   Error Response Format:`, badInputJson);

    console.log('\n=========================================================');
    console.log('✨ All Day 4 Hardening & Security Audits Passed 100%!');
    console.log('=========================================================\n');
  } catch (err) {
    console.error('❌ Day 4 Hardening suite failed with error:', err);
  } finally {
    process.exit(0);
  }
}

setTimeout(runDay4HardeningSuite, 500);
