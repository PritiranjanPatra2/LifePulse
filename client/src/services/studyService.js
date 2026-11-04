import api from './api';

export const studyService = {
  getStudyOverview: async () => {
    const res = await api.get('/study');
    return res.data;
  },

  createSubject: async (data) => {
    const res = await api.post('/study/subject', data);
    return res.data;
  },

  updateSubject: async (subjectId, data) => {
    const res = await api.put(`/study/subject/${subjectId}`, data);
    return res.data;
  },

  deleteSubject: async (subjectId) => {
    const res = await api.delete(`/study/subject/${subjectId}`);
    return res.data;
  },

  addChapter: async (subjectId, data) => {
    const res = await api.post(`/study/subject/${subjectId}/chapter`, data);
    return res.data;
  },

  updateChapter: async (subjectId, chapterId, data) => {
    const res = await api.put(`/study/subject/${subjectId}/chapter/${chapterId}`, data);
    return res.data;
  },

  deleteChapter: async (subjectId, chapterId) => {
    const res = await api.delete(`/study/subject/${subjectId}/chapter/${chapterId}`);
    return res.data;
  },

  addSubtopic: async (subjectId, chapterId, data) => {
    const res = await api.post(
      `/study/subject/${subjectId}/chapter/${chapterId}/subtopic`,
      data
    );
    return res.data;
  },

  updateSubtopic: async (subjectId, chapterId, subtopicId, data) => {
    const res = await api.put(
      `/study/subject/${subjectId}/chapter/${chapterId}/subtopic/${subtopicId}`,
      data
    );
    return res.data;
  },

  incrementQuestions: async (subjectId, chapterId, subtopicId, delta) => {
    const res = await api.patch(
      `/study/subject/${subjectId}/chapter/${chapterId}/subtopic/${subtopicId}/questions`,
      { delta }
    );
    return res.data;
  },

  deleteSubtopic: async (subjectId, chapterId, subtopicId) => {
    const res = await api.delete(
      `/study/subject/${subjectId}/chapter/${chapterId}/subtopic/${subtopicId}`
    );
    return res.data;
  },

  seedTemplate: async (templateType) => {
    const res = await api.post('/study/seed-template', { templateType });
    return res.data;
  },
};

