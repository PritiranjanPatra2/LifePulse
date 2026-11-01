import api from './api';

export const uploadService = {
  uploadImage: async (base64Image) => {
    const res = await api.post('/upload', { image: base64Image });
    return res.data;
  },

  uploadAvatar: async (base64Image) => {
    const res = await api.post('/upload/avatar', { image: base64Image });
    return res.data;
  },
};

