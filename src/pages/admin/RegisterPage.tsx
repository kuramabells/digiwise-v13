import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { Person, Email, Lock } from '@mui/icons-material';
import { registerAdmin } from '../../services/api/adminApi';

interface RegisterFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        setError('All fields are required');
        return;
      }

      const response = await registerAdmin({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name
      });

      if (response.status === 201) {
        // Log successful registration
        console.log('Admin registration successful:', {
          email: formData.email,
          timestamp: new Date().toISOString()
        });
        
        // Show success message and redirect to login page
        alert('Registration successful! You will be redirected to the login page.');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/admin/login', {
            state: { 
              registrationSuccess: true,
              email: formData.email 
            },
            replace: true
          });
        }, 1500);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Too many requests')) {
        setError('Too many requests. Please wait a moment and try again.');
        setRetryCount(prev => prev + 1);
        
        // If we've retried 3 times, show a more specific message
        if (retryCount >= 3) {
          setError('Too many attempts. Please wait a few minutes before trying again.');
        }
      } else {
        if (typeof err === 'object' && err && 'response' in err && (err as any).response?.data?.message) {
          setError((err as any).response.data.message || 'Registration failed. Please try again.');
        } else if (err instanceof Error) {
          setError(err.message || 'Registration failed. Please try again.');
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h5">
              Admin Registration
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="first_name"
              label="First Name"
              name="first_name"
              autoComplete="given-name"
              value={formData.first_name}
              onChange={handleChange}
              error={!!error && !formData.first_name}
              helperText={!formData.first_name ? 'First name is required' : ''}
              InputProps={{
                startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="last_name"
              label="Last Name"
              name="last_name"
              autoComplete="family-name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!error && !formData.last_name}
              helperText={!formData.last_name ? 'Last name is required' : ''}
              InputProps={{
                startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!error && !formData.email}
              helperText={!formData.email ? 'Email is required' : ''}
              InputProps={{
                startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!error && !formData.password}
              helperText={!formData.password ? 'Password is required' : ''}
              InputProps={{
                startAdornment: <Lock sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/admin/login')}
              sx={{ mt: 1 }}
            >
              Already have an account? Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage; 