import api from './api';

export const weightService = {
  getWeightLogs: async (params = {}) => {
    const res = await api.get('/weight', { params });
    return res.data;
  },

  getWeightSummary: async () => {
    const res = await api.get('/weight/summary');
    return res.data;
  },

  logWeight: async (data) => {
    const res = await api.post('/weight', data);
    return res.data;
  },

  deleteWeightLog: async (id) => {
    const res = await api.delete(`/weight/${id}`);
    return res.data;
  },
};
