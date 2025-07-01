import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { examineeApi } from '../services/api/examineeApi';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  ageRange?: string;
  age_range?: string; // Backend might return this
  region?: string;
  role: string;
  first_name?: string; // Backend might return this
  last_name?: string;  // Backend might return this
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UserContextType {
  state: UserState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean }>;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, setState] = useState<UserState>({
    user: null,
    token: localStorage.getItem('userToken'),
    isAuthenticated: false,
    isLoading: true
  });

  // Verify token and load user data on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await axios.get<{ user: User }>(`${import.meta.env.VITE_API_BASE_URL || '/api'}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.user) {
          setState({
            user: response.data.user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          throw new Error('No user data received');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('userToken');
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      console.log('=== Login Debug ===');
      console.log('Sending login request to:', '/api/users/login');
      console.log('Email:', email);
      
      // Log the exact request being sent
      const requestData = {
        email: email.trim(),
        password: password // Don't log the actual password in production
      };
      
      console.log('Request payload:', JSON.stringify({
        ...requestData,
        password: '***' // Mask password in logs
      }, null, 2));
      
      const response = await axios({
        method: 'post',
        url: `${import.meta.env.VITE_API_BASE_URL || 'http://69.62.74.112:5001/api'}/users/login`,
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true,
        validateStatus: (status) => status < 500 // Don't throw for 4xx errors
      });

      console.log('=== Login Response ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Response data:', response.data);
      console.log('Response headers:', response.headers);

      if (response.status === 401) {
        console.error('Authentication failed. Possible reasons:');
        console.error('- Incorrect email or password');
        console.error('- User does not exist');
        console.error('- Account is not activated');
        throw new Error('Invalid email or password');
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const { user, token, status, success } = response.data;
      
      if (status !== 'success' || !success || !user || !token) {
        throw new Error(response.data.message || 'Authentication failed');
      }
      
      // Map the response data to our User interface
      const userData: User = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || 'user'
      };

      // Update the state with the user data
      setState({
        user: userData,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      // Store token in localStorage
      localStorage.setItem('userToken', token);
      console.log('Token stored in localStorage');

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Optional: Call the backend logout endpoint if you have one
      // await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://69.62.74.112:5001/api'}/users/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear frontend state and storage
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      localStorage.removeItem('userToken');
      // Clear any other stored data if needed
      // localStorage.clear(); // Be careful with this as it clears everything
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      console.log('=== User Registration Debug ===');
      console.log('Raw user data:', userData);
      
      // Prepare the registration data with snake_case field names
      const registrationData = {
        first_name: userData.first_name || userData.firstName || '',
        last_name: userData.last_name || userData.lastName || '',
        email: userData.email || '',
        password: userData.password,
        age_range: userData.age_range || userData.ageRange || '',
        region: userData.region || '',
        role: userData.role || 'examinee' // Default role if not provided
      };
      
      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'email', 'password', 'age_range', 'region'];
      const missingFields = requiredFields.filter(field => !registrationData[field as keyof typeof registrationData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      console.log('Processed registration data:', registrationData);
      
      // Use the examineeApi to handle the registration
      const response = await examineeApi.register(registrationData);
      
      console.log('=== Registration Response ===');
      console.log('Response data:', response);

      if (!response) {
        throw new Error('No response received from server');
      }

      // The backend should return user data and token
      const { user, token } = response;
      
      if (!user || !token) {
        throw new Error('Registration failed: Invalid response format');
      }
      
      // Map the response data to our User interface
      const newUser: User = {
        id: user.id,
        // Map both camelCase and snake_case from response
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email,
        ageRange: user.ageRange || user.age_range,
        region: user.region,
        role: user.role || 'examinee',
        // Keep snake_case for form compatibility
        first_name: user.firstName || user.first_name || '',
        last_name: user.lastName || user.last_name || '',
        age_range: user.ageRange || user.age_range
      };
      
      console.log('Mapped user data with camelCase:', newUser);
      
      console.log('Mapped user data from response:', newUser);
      
      setState({
        user: newUser,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      
      localStorage.setItem('userToken', token);
      console.log('User registration successful:', newUser.email);
      
      return { success: true };
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response) {
        throw new Error(`Registration failed: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Registration failed');
      }
    }
  };

  // Show loading state while verifying token
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        state,
        login,
        logout,
        register
      }}
    >
      {children}
    </UserContext.Provider>
  );
};