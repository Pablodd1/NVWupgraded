const axios = require('axios');
// Environment variables are loaded via --env-file flag

const API_URL = 'http://localhost:3000/api/ai-search';

async function testAISearch() {
    const queries = [
        "I want a modern winery in Calistoga that has outdoor seating and costs less than $100",
        "Looking for sparkling wine and great views",
        "Romantic reds in Rutherford"
    ];

    console.log("🍷 Starting AI-Powered Search Test...");

    for (const query of queries) {
        console.log(`\n🔍 Searching for: "${query}"`);
        try {
            const response = await axios.post(API_URL, { query });
            const { filters, wineries, count } = response.data;

            console.log(`✅ AI Interpretation: ${filters.interpretation}`);
            console.log(`📊 Found ${count} wineries.`);

            if (wineries.length > 0) {
                console.log(`🏆 Top Match: ${wineries[0].name}`);
            }
        } catch (error) {
            console.error(`❌ Test failed for query: "${query}"`);
            console.error(error.response ? error.response.data : error.message);
        }
    }
}

testAISearch();
