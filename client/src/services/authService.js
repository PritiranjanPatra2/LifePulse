import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('lifepulse_token', res.data.token);
      localStorage.setItem('lifepulse_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('lifepulse_token', res.data.token);
      localStorage.setItem('lifepulse_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (userData) => {
    const res = await api.put('/auth/profile', userData);
    if (res.data.user) {
      localStorage.setItem('lifepulse_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('lifepulse_token');
    localStorage.removeItem('lifepulse_user');
  },
};
