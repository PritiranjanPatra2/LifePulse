import api from './api';

export const foodService = {
  getFoods: async (params = {}) => {
    const res = await api.get('/foods', { params });
    return res.data;
  },

  createFood: async (foodData) => {
    const res = await api.post('/foods', foodData);
    return res.data;
  },

  updateFood: async (id, foodData) => {
    const res = await api.put(`/foods/${id}`, foodData);
    return res.data;
  },

  deleteFood: async (id) => {
    const res = await api.delete(`/foods/${id}`);
    return res.data;
  },
};
