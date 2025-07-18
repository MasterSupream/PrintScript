// Simple test to verify proxy configuration
const axios = require('axios');

async function testProxyConfiguration() {
  try {
    console.log('Testing proxy configuration...');
    
    // Test the root endpoint
    const rootResponse = await axios.get('http://localhost:3000/');
    console.log('✓ Root endpoint accessible');
    
    // Test the API endpoint through proxy
    const apiResponse = await axios.post('http://localhost:3000/api/generate-pdf', {
      markdown: '# Test Markdown',
      options: {}
    });
    console.log('✓ API endpoint accessible through proxy');
    console.log('Response:', apiResponse.data);
    
  } catch (error) {
    console.error('✗ Proxy test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testProxyConfiguration();