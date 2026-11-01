import api from './api';

export const goalService = {
  getGoals: async () => {
    const res = await api.get('/goals');
    return res.data;
  },

  updateGoals: async (data) => {
    const res = await api.put('/goals', data);
    return res.data;
  },
};

