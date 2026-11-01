import api from './api';

export const dashboardService = {
  getDashboardData: async (date) => {
    const res = await api.get(`/dashboard/${date}`);
    return res.data;
  },
};
