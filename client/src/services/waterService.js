import api from './api';

export const waterService = {
  getWaterLogs: async (params = {}) => {
    const res = await api.get('/water', { params });
    return res.data;
  },

  getWaterSummary: async (date) => {
    const res = await api.get('/water/summary', { params: { date } });
    return res.data;
  },

  addWater: async (data) => {
    const res = await api.post('/water', data);
    return res.data;
  },

  updateWater: async (id, data) => {
    const res = await api.put(`/water/${id}`, data);
    return res.data;
  },

  deleteWater: async (id) => {
    const res = await api.delete(`/water/${id}`);
    return res.data;
  },

  undoLastWater: async (date) => {
    const res = await api.post('/water/undo', { date });
    return res.data;
  },
};

