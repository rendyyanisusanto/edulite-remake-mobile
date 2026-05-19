import apiClient from './axios'

export const extracurricularApi = {
  // Admin/coach endpoints
  getSessions: (params) => apiClient.get('/api/extracurricular/sessions', { params }),
  openSession: (id) => apiClient.post(`/api/extracurricular/sessions/${id}/open`),
  closeSession: (id) => apiClient.post(`/api/extracurricular/sessions/${id}/close`),
  coachCheckin: (id, payload = {}) => apiClient.post(`/api/extracurricular/sessions/${id}/coach-checkin`, payload),
  coachCheckout: (id, payload = {}) => apiClient.post(`/api/extracurricular/sessions/${id}/coach-checkout`, payload),
  getSessionAttendances: (id) => apiClient.get(`/api/extracurricular/sessions/${id}/student-attendances`),
  bulkSessionAttendances: (id, attendances) => apiClient.post(`/api/extracurricular/sessions/${id}/student-attendances/bulk`, { attendances }),

  // My endpoints
  getMyExtracurricular: () => apiClient.get('/api/my/extracurricular'),
  getMyExtracurriculars: () => apiClient.get('/api/my/extracurricular'),
  getMyExtracurricularDetail: (id) => apiClient.get(`/api/my/extracurricular/${id}`),
  getMySchedules: (id) => apiClient.get(`/api/my/extracurricular/${id}/schedules`),
  getMyMembers: (id) => apiClient.get(`/api/my/extracurricular/${id}/members`),
  getExtracurricularMembers: (id, params = {}) => apiClient.get(`/api/my/extracurricular/${id}/members`, { params }),
  getProgressAspects: (extracurricularId) => apiClient.get(`/api/my/extracurricular/${extracurricularId}/progress-aspects`),
  getStudentProgress: ({ extracurricular_id, student_id, ...params }) =>
    apiClient.get(`/api/my/extracurricular/${extracurricular_id}/students/${student_id}/progress`, { params }),
  createStudentProgress: (payload) => apiClient.post('/api/extracurricular/student-progress', payload),
  updateStudentProgress: (id, payload) => apiClient.put(`/api/extracurricular/student-progress/${id}`, payload),
  getMySessionsToday: () => apiClient.get('/api/my/extracurricular/sessions/today'),
  getMyAttendances: (params) => apiClient.get('/api/my/extracurricular/attendances', { params }),
  getMyProgress: (params) => apiClient.get('/api/my/extracurricular/progress', { params })
}
