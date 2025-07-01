import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Person, Email, LocationOn, Cake } from '@mui/icons-material';
import type { UserFormData } from '../services/api/examineeApi';
import { examineeApi } from '../services/api/examineeApi';
import type { SelectChangeEvent } from '@mui/material/Select';

const ExamineeRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age_range: '',
    region: '',
    role: 'examinee'
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
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
      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'email', 'password', 'confirmPassword', 'age_range', 'region'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof typeof formData];
        return value === undefined || value === null || value === '';
      });
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ').replace(/_/g, ' ')}`);
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validate password strength (at least 8 characters, 1 number, 1 letter)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must be at least 8 characters long and contain at least one letter and one number');
        return;
      }

      // Prepare the registration data (exclude confirmPassword as it's not needed by the backend)
      const { confirmPassword, ...registrationData } = formData;
      
      const response = await examineeApi.register(registrationData);

      if (response.success) {
        // Show success message and redirect to login page
        setError('');
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please log in with your credentials.' 
          } 
        });
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.message.includes('Too many requests')) {
        setError('Too many requests. Please wait a moment and try again.');
        setRetryCount(prev => prev + 1);
        
        // If we've retried 3 times, show a more specific message
        if (retryCount >= 3) {
          setError('Too many attempts. Please wait a few minutes before trying again.');
        }
      } else if (err.response?.data?.message) {
        // Use the error message from the backend if available
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again later.');
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
              Examinee Registration
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="first_name"
                label="First Name"
                name="first_name"
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                error={!!error && !formData.last_name}
                helperText={!formData.last_name ? 'Last name is required' : ''}
              />
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
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
              id="password"
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!error && !formData.password}
              helperText={!formData.password ? 'Password is required' : ''}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!error && formData.password !== formData.confirmPassword}
              helperText={formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
            />
            <FormControl fullWidth margin="normal" required error={!!error && !formData.age_range}>
              <InputLabel id="age-range-label">Age Range</InputLabel>
              <Select
                labelId="age-range-label"
                id="age_range"
                name="age_range"
                value={formData.age_range}
                onChange={handleSelectChange}
                label="Age Range"
                startAdornment={<Cake sx={{ color: 'action.active', mr: 1 }} />}
              >
                <MenuItem value="18-24">18-24</MenuItem>
                <MenuItem value="25-34">25-34</MenuItem>
                <MenuItem value="35-44">35-44</MenuItem>
                <MenuItem value="45-54">45-54</MenuItem>
                <MenuItem value="55+">55+</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required error={!!error && !formData.region}>
              <InputLabel id="region-label">Region</InputLabel>
              <Select
                labelId="region-label"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleSelectChange}
                label="Region"
                startAdornment={<LocationOn sx={{ color: 'action.active', mr: 1 }} />}
              >
                <MenuItem value="north">North</MenuItem>
                <MenuItem value="south">South</MenuItem>
                <MenuItem value="east">East</MenuItem>
                <MenuItem value="west">West</MenuItem>
                <MenuItem value="central">Central</MenuItem>
              </Select>
            </FormControl>
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
              onClick={() => navigate('/login')}
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

export default ExamineeRegisterPage; 