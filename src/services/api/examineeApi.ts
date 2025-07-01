import axios from 'axios';

// Use environment variable if available, otherwise use the production server URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://69.62.74.112:5001/api';

// Configure axios instance with retry logic and proper JSON handling
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: true,
  transformRequest: [
    (data, headers) => {
      if (data) {
        const jsonData = JSON.stringify(data);
        console.log('Sending request with data:', jsonData);
        headers['Content-Length'] = Buffer.byteLength(jsonData, 'utf8');
        return jsonData;
      }
      return data;
    }
  ]
});

// Add retry interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 429 (Too Many Requests) and we haven't retried yet
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Retry the request
      return axiosInstance(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  age_range: string;
  region: string;
  role?: string;
}

export interface Answer {
  questionId: number;
  value: number;
}

export interface AssessmentResult {
  examinationId: number;
  overallScore: number;
  categoryScores: Record<string, number>;
  riskLevel: string;
}

export const examineeApi = {
  // Register a new examinee
  register: async (userData: Omit<UserFormData, 'confirmPassword'>) => {
    try {
      // Ensure all fields are properly mapped to snake_case for the backend
      const payload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password,
        age_range: userData.age_range,
        region: userData.region,
        role: userData.role || 'examinee'  // Default role if not provided
      };

      console.log('=== Registration Payload ===');
      console.log('Sending to /auth/register:', JSON.stringify(payload, null, 2));
      
      // Make the request with explicit headers
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/auth/register`,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('=== Registration Response ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error: unknown) {
      console.error('Registration API error:', error);
      
      if (typeof error === 'object' && error !== null) {
        const axiosError = error as any;
        
        // Handle rate limiting
        if (axiosError.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        
        // Handle validation errors
        if (axiosError.response?.status === 400) {
          const errorMessage = axiosError.response.data?.message || 'Invalid registration data';
          throw new Error(Array.isArray(errorMessage) ? errorMessage.join(' ') : errorMessage);
        }
        
        // Handle server errors
        if (axiosError.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        // Use the error message from the backend if available
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
        
        // Handle network errors
        if (axiosError.message === 'Network Error') {
          throw new Error('Unable to connect to the server. Please check your internet connection.');
        }
      }
      
      // If we don't have a specific error to show, throw a generic one
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unknown error occurred during registration.');
    }
  },

  // Login an examinee
  login: async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/examinees/login', { email, password });
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error && (error as any).response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred.');
    }
  },

  // Save examinee information
  saveInfo: async (data: UserFormData & { examination_id: number }) => {
    try {
      const response = await axiosInstance.post('/examinees/info', data);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error && (error as any).response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred.');
    }
  },

  // Start a new examination
  startExamination: async (userId: number) => {
    try {
      const response = await axiosInstance.post('/examinations/start', { userId });
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error && (error as any).response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred.');
    }
  },

  // Submit answers for an examination
  submitAnswers: async (examinationId: number, answers: Answer[]) => {
    try {
      const response = await axiosInstance.post(`/examinations/${examinationId}/answers`, { answers });
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error && (error as any).response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred.');
    }
  },

  // Complete an examination
  completeExamination: async (examinationId: number) => {
    try {
      const response = await axiosInstance.post(`/examinations/${examinationId}/complete`);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error && (error as any).response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred.');
    }
  },

  // Get examination results
  getResults: async (examinationId: number) => {
    try {
      const response = await axiosInstance.get(`/examinations/${examinationId}/results`);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error && (error as any).response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred.');
    }
  },

  // Get user's examination history
  getExaminationHistory: async (userId: number) => {
    try {
      const response = await axiosInstance.get(`/examinees/${userId}/examinations`);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'response' in error && (error as any).response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (error instanceof Error) throw error;
      throw new Error('Unknown error occurred.');
    }
  }
}; 