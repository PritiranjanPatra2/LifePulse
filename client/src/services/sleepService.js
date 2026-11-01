import api from './api';

export const sleepService = {
  getSleepLogs: async (params = {}) => {
    const res = await api.get('/sleep', { params });
    return res.data;
  },

  logSleep: async (data) => {
    const res = await api.post('/sleep', data);
    return res.data;
  },

  deleteSleepLog: async (id) => {
    const res = await api.delete(`/sleep/${id}`);
    return res.data;
  },
};

