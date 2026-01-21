// Simple test script to verify engagement endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test without authentication (should get 401)
async function testEndpoints() {
  console.log('🧪 Testing Engagement & Interaction System endpoints...\n');

  const endpoints = [
    { method: 'GET', url: '/chat/event/2', description: 'Get chat messages' },
    { method: 'GET', url: '/polls/event/2', description: 'Get polls' },
    { method: 'GET', url: '/questions/event/2', description: 'Get questions' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.url} - ${endpoint.description}`);
      
      const response = await axios({
        method: endpoint.method,
        url: BASE_URL + endpoint.url,
        timeout: 5000
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Response: ${JSON.stringify(response.data).substring(0, 100)}...\n`);
      
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  Status: ${error.response.status}`);
        console.log(`📄 Error: ${error.response.data.error || 'Unknown error'}`);
        
        if (error.response.status === 401) {
          console.log('✅ Expected 401 - Authentication required\n');
        } else {
          console.log('❌ Unexpected error\n');
          console.log('Full error:', error.response.data);
        }
      } else {
        console.log(`❌ Network error: ${error.message}\n`);
      }
    }
  }
  
  console.log('🎉 Test completed!');
}

testEndpoints().catch(console.error);