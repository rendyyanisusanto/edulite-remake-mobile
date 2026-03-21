import apiClient from './axios'

export const positiveApi = {
  getStudentPoints: (params = {}) =>
    apiClient.get('/api/positive-points/student-points', { params }),
  getPointTypes: () => apiClient.get('/api/positive-points/types'),
  createStudentPoint: (data) =>
    apiClient.post('/api/positive-points/student-points', data)
}
