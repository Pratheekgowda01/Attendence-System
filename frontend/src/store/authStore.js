import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Load from localStorage on init
const loadStoredAuth = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.token && parsed.user) {
        return { token: parsed.token, user: parsed.user };
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return { token: null, user: null };
};

const stored = loadStoredAuth();

const useAuthStore = create((set, get) => ({
  user: stored.user,
  token: stored.token,
  isAuthenticated: !!stored.token,

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      set({
        user,
        token,
        isAuthenticated: true
      });

      // Save to localStorage
      localStorage.setItem('auth-storage', JSON.stringify({ token, user }));

      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      const { token, user } = response.data;

      set({
        user,
        token,
        isAuthenticated: true
      });

      // Save to localStorage
      localStorage.setItem('auth-storage', JSON.stringify({ token, user }));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
    localStorage.removeItem('auth-storage');
    delete axios.defaults.headers.common['Authorization'];
  },

  loadUser: async () => {
    try {
      const state = get();
      if (state.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        const response = await axios.get(`${API_URL}/api/auth/me`);
        const updatedUser = response.data.user;
        set({
          user: updatedUser,
          isAuthenticated: true
        });
        // Update localStorage
        localStorage.setItem('auth-storage', JSON.stringify({ token: state.token, user: updatedUser }));
      }
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
      localStorage.removeItem('auth-storage');
      delete axios.defaults.headers.common['Authorization'];
    }
  }
}));

// Initialize auth header on load
if (stored.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${stored.token}`;
}

export { useAuthStore };

