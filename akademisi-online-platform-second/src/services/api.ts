import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// Use relative URL in development to work with Vite proxy
const API_URL = import.meta.env.DEV ? '/api' : 'http://localhost:5000/api';
console.log('API URL:', API_URL);

// Define error response type
interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  validationErrors?: Record<string, string[]>;
}

const TOKEN_KEY = 'akademisi-token';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    // Log request details
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });

    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    // Log response details
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    console.error('Response error:', error);

    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          if (data.validationErrors) {
            // Handle validation errors
            Object.values(data.validationErrors).forEach(errors => {
              errors.forEach(error => toast.error(error));
            });
          } else {
            toast.error(data.message || 'Invalid request');
          }
          break;
        case 401:
          toast.error('Please log in to continue');
          // Redirect to login if needed
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error('An unexpected error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/health');
    console.log('API connection test successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
};

// Run API connection test
testApiConnection().catch(console.error);

export default api; 