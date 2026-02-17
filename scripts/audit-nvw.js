const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function audit() {
    console.log('🔍 Starting NVW System Audit...');
    console.log(`Target: ${BASE_URL}\n`);

    const endpoints = [
        { method: 'GET', url: '/', name: 'Frontend: Home' },
        { method: 'GET', url: '/admin/login', name: 'Frontend: Admin Login' },
        { method: 'GET', url: '/api/health', name: 'API: Health Check' }, // Assuming this exists or returns 404
        { method: 'GET', url: '/api/winery', name: 'API: List Wineries' },
        // Admin endpoints (require auth - will fail with 401, confirming security)
        { method: 'GET', url: '/api/admin/stats', name: 'API: Admin Stats (Security Check)', expectedStatus: 401 },
        { method: 'GET', url: '/api/admin/bookings', name: 'API: Admin Bookings (Security Check)', expectedStatus: 401 },
    ];

    let passed = 0;
    let failed = 0;

    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint.name} (${endpoint.method} ${endpoint.url})...`);
            const response = await axios({
                method: endpoint.method,
                url: `${BASE_URL}${endpoint.url}`,
                validateStatus: () => true // Don't throw on error status
            });

            const expected = endpoint.expectedStatus || 200;

            if (response.status === expected) {
                console.log(`✅ PASS: Status ${response.status}`);
                passed++;
            } else {
                // Allow 200-299 for general success if not specified
                if (!endpoint.expectedStatus && response.status >= 200 && response.status < 300) {
                    console.log(`✅ PASS: Status ${response.status}`);
                    passed++;
                } else {
                    console.error(`❌ FAIL: Expected ${expected}, got ${response.status}`);
                    failed++;
                }
            }
        } catch (error) {
            console.error(`❌ ERROR: Connection Failed - ${error.message}`);
            failed++;
        }
        console.log('---');
    }

    console.log(`\nAudit Complete.`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed === 0) {
        console.log('🚀 SYSTEM HEALTHY');
    } else {
        console.log('⚠️ ISSUES DETECTED');
    }
}

audit();
