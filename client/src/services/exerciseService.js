import api from './api';

export const exerciseService = {
  getExercises: async (params = {}) => {
    const res = await api.get('/exercises', { params });
    return res.data;
  },

  createExercise: async (data) => {
    const res = await api.post('/exercises', data);
    return res.data;
  },

  updateExercise: async (id, data) => {
    const res = await api.put(`/exercises/${id}`, data);
    return res.data;
  },

  deleteExercise: async (id) => {
    const res = await api.delete(`/exercises/${id}`);
    return res.data;
  },
};

