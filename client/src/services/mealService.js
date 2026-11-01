import api from './api';

export const mealService = {
  getMeals: async (params = {}) => {
    const res = await api.get('/meals', { params });
    return res.data;
  },

  createMeal: async (mealData) => {
    const res = await api.post('/meals', mealData);
    return res.data;
  },

  updateMeal: async (id, mealData) => {
    const res = await api.put(`/meals/${id}`, mealData);
    return res.data;
  },

  deleteMeal: async (id) => {
    const res = await api.delete(`/meals/${id}`);
    return res.data;
  },
};
