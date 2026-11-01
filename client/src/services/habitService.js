import api from './api';

export const habitService = {
  getHabits: async (date) => {
    const res = await api.get('/habits', { params: { date } });
    return res.data;
  },

  createHabit: async (data) => {
    const res = await api.post('/habits', data);
    return res.data;
  },

  updateHabit: async (id, data) => {
    const res = await api.put(`/habits/${id}`, data);
    return res.data;
  },

  deleteHabit: async (id) => {
    const res = await api.delete(`/habits/${id}`);
    return res.data;
  },

  toggleHabit: async (habitId, date) => {
    const res = await api.post('/habits/log', { habitId, date });
    return res.data;
  },

  getHabitAnalytics: async (days = 60) => {
    const res = await api.get('/habits/analytics', { params: { days } });
    return res.data;
  },
};
