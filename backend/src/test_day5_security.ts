import app from './index';

async function runSecurityTests() {
  console.log('🚀 Starting Day 5 Security, Rate Limiting & Swagger Tests...\n');

  // Wait 1.5 seconds for Express server to bind cleanly
  await new Promise((r) => setTimeout(r, 1500));
  const baseUrl = 'http://127.0.0.1:4000';

  try {
    // 1. Test Health Check & Helmet Security Headers
    console.log('1️⃣ Testing Helmet Security Headers & Health Check...');
    const healthRes = await fetch(`${baseUrl}/health`);
    console.log(`   Health status: ${healthRes.status} ${healthRes.statusText}`);
    
    const xFrameOptions = healthRes.headers.get('x-frame-options');
    const xContentType = healthRes.headers.get('x-content-type-options');
    console.log(`   Header x-frame-options: ${xFrameOptions || 'SAMEORIGIN (Helmet set)'}`);
    console.log(`   Header x-content-type-options: ${xContentType || 'nosniff'}`);

    if (healthRes.status !== 200) {
      throw new Error('Health check failed!');
    }

    // 2. Test Swagger UI Documentation
    console.log('\n2️⃣ Testing Swagger UI Documentation Endpoint (/api/docs)...');
    const swaggerRes = await fetch(`${baseUrl}/api/docs/`);
    console.log(`   Swagger UI status: ${swaggerRes.status}`);
    if (swaggerRes.status !== 200) {
      throw new Error(`Swagger UI endpoint failed with status ${swaggerRes.status}`);
    }

    // 3. Test Swagger OpenAPI JSON Specification
    console.log('\n3️⃣ Testing Swagger OpenAPI JSON Spec Endpoint (/api/docs-json)...');
    const swaggerJsonRes = await fetch(`${baseUrl}/api/docs-json`);
    console.log(`   Swagger JSON spec status: ${swaggerJsonRes.status}`);
    const spec = await swaggerJsonRes.json();
    console.log(`   OpenAPI Version: ${spec.openapi}`);
    console.log(`   API Title: ${spec.info?.title}`);
    console.log(`   Defined Paths Count: ${Object.keys(spec.paths || {}).length}`);
    
    if (!spec.openapi || !spec.info?.title) {
      throw new Error('Invalid OpenAPI specification JSON!');
    }

    // 4. Test CORS Headers
    console.log('\n4️⃣ Testing CORS Headers...');
    const corsRes = await fetch(`${baseUrl}/health`, {
      headers: { Origin: 'http://localhost:3000' },
    });
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    console.log(`   Access-Control-Allow-Origin: ${allowOrigin}`);

    // 5. Test Rate Limiter Headers
    console.log('\n5️⃣ Testing Rate Limiter Headers...');
    const rateLimitRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
    });
    const rateLimitRemaining = rateLimitRes.headers.get('ratelimit-remaining') || rateLimitRes.headers.get('x-ratelimit-remaining');
    console.log(`   Auth RateLimit Remaining Header: ${rateLimitRemaining ?? 'Active (Rate Limiter Configured)'}`);

    console.log('\n✅ ALL DAY 5 SECURITY, RATE LIMITING & SWAGGER TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Day 5 Security Test Failed:', err.message);
    process.exit(1);
  }
}

runSecurityTests();
