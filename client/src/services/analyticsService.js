import api from './api';

export const analyticsService = {
  getOverview: async (params = {}) => {
    const res = await api.get('/analytics/overview', { params });
    return res.data;
  },

  getSmartInsights: async () => {
    const res = await api.get('/analytics/insights');
    return res.data;
  },
};

