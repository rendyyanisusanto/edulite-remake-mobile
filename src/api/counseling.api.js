import apiClient from './axios'

export const counselingApi = {
  getCases: (params = {}) => apiClient.get('/api/counseling-cases', { params }),
  getCaseById: (id) => apiClient.get(`/api/counseling-cases/${id}`),
  getSessions: (params = {}) => apiClient.get('/api/counseling-sessions', { params }),
  getSessionById: (id) => apiClient.get(`/api/counseling-sessions/${id}`)
}
