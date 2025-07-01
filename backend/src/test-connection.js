const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing connection to backend...');
    
    // Test health check endpoint
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('Health check response:', healthResponse.data);
    
    // Test admin registration endpoint
    const testData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    console.log('\nSending test registration request...');
    const registerResponse = await axios.post('http://localhost:5001/api/admins/register', testData, {
      validateStatus: () => true // Don't throw on HTTP error status
    });
    
    console.log('\nRegistration test response:');
    console.log('Status:', registerResponse.status);
    console.log('Data:', registerResponse.data);
    
  } catch (error) {
    console.error('\n=== Test Failed ===');
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is the server running?');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    console.error('=== End of Error ===\n');
  }
}

testConnection();
