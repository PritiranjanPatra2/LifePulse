import api from './api';

export const dailyLogService = {
  getDailyLogs: async (params = {}) => {
    const res = await api.get('/daily-logs', { params });
    return res.data;
  },

  upsertDailyLog: async (data) => {
    const res = await api.post('/daily-logs', data);
    return res.data;
  },
};
