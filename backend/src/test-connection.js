const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing connection to backend...');
    
    // Test health check endpoint
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('Health check response:', healthResponse.data);
    
    // Test admin registration
    const adminData = {
      email: 'testadmin@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Admin'
    };

    console.log('\nSending admin registration request...');
    const adminRegister = await axios.post('http://localhost:5001/api/admins/register', adminData, {
      validateStatus: () => true
    });
    console.log('Admin registration status:', adminRegister.status);

    console.log('Testing admin login...');
    const adminLogin = await axios.post('http://localhost:5001/api/admins/login', {
      email: adminData.email,
      password: adminData.password
    });
    console.log('Admin login response:', adminLogin.data);

    // Test user registration and login
    const userData = {
      email: 'snake_user@example.com',
      password: 'password123',
      first_name: 'Snake',
      last_name: 'Case',
      age_range: '18-25',
      region: 'Region I'
    };
    console.log('\nSending user registration request...');
    await axios.post('http://localhost:5001/api/auth/register', userData);

    console.log('Testing user login...');
    const userLogin = await axios.post('http://localhost:5001/api/auth/login', {
      email: userData.email,
      password: userData.password
    });
    console.log('User login response:', userLogin.data);
    
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
