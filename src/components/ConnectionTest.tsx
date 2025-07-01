import { useEffect, useState } from 'react';
import api from '../lib/api';

// Available backend endpoints to test
const TEST_ENDPOINTS = [
  { path: '/health', description: 'Basic health check' },
  { path: '/api/health', description: 'API health check' },
  { path: '/', description: 'Root endpoint' }
];

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing connection to backend...');
  const [error, setError] = useState('');
  const [testedEndpoints, setTestedEndpoints] = useState<{[key: string]: string}>({});
  const [isTesting, setIsTesting] = useState(true);

  useEffect(() => {
    const testEndpoints = async () => {
      setIsTesting(true);
      const results: {[key: string]: string} = {};
      let connectionSuccessful = false;
      
      for (const { path, description } of TEST_ENDPOINTS) {
        try {
          setStatus(`Trying ${path} (${description})...`);
          setError('');
          const response = await api.get(path);
          results[path] = `✅ Success (${response.status} ${response.statusText})`;
          setTestedEndpoints({...results});
          
          // If we get any successful response, consider it a success
          connectionSuccessful = true;
          setStatus('✅ Connection successful!');
          console.log(`Success at ${endpoint}:`, response.data);
        } catch (err: any) {
          const status = err.response?.status || 'No response';
          const message = err.response?.data?.message || (err instanceof Error ? err.message : 'Unknown error occurred');
          const errorMessage = `❌ Failed to connect to ${path}: ${status} - ${message}`;
          
          setError(errorMessage);
          results[path] = `❌ Failed: ${status} - ${message}`;
          setTestedEndpoints({...results});
          if (!connectionSuccessful) {
            setStatus('❌ Connection failed');
          }
          console.error(`Error at ${path}:`, err);
        }
      }
      
      // If we get here, all endpoints failed
      setStatus('All connection attempts failed');
    };

    testEndpoints();
    return () => setIsTesting(false);
  }, []);

  // Display a loading indicator while testing
  if (isTesting) {
    return (
      <div className="connection-test" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div className="status">{status}</div>
        {error && <div className="error">{error}</div>}
        <div className="tested-endpoints">
          {Object.entries(testedEndpoints).map(([path, result]) => (
            <div key={path} className="endpoint-result" style={{ marginBottom: '8px' }}>
              <strong>{path}</strong> - {result}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Backend Connection Test</h2>
      <div style={{ marginBottom: '20px' }}>
        <div>Status: <strong>{status}</strong></div>
        <div>API Base URL: <code>{import.meta.env.VITE_API_BASE_URL || 'Not set'}</code></div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Test Results:</h3>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
          {Object.entries(testedEndpoints).map(([endpoint, result]) => (
            <div key={endpoint} style={{ margin: '5px 0' }}>
              <strong>{endpoint}:</strong> {result}
            </div>
          ))}
          {Object.keys(testedEndpoints).length === 0 && 'No endpoints tested yet...'}
        </div>
      </div>
      
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ffebee',
          borderLeft: '4px solid #f44336',
          color: '#b71c1c'
        }}>
          <h4>Error Details:</h4>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: '10px 0 0',
            padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
            overflowX: 'auto'
          }}>
            {error}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <p>If all endpoints fail, please check:</p>
        <ul style={{ margin: '5px 0 0 20px' }}>
          <li>Is the backend server running?</li>
          <li>Is the IP address and port correct?</li>
          <li>Is there a firewall blocking the connection?</li>
          <li>Is the backend configured to accept requests from this origin?</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;
