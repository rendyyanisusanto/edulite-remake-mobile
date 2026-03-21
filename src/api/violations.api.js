import apiClient from './axios'

export const violationsApi = {
  getStudentViolations: (params = {}) =>
    apiClient.get('/api/violations/student-violations', { params }),
  getViolationTypes: () => apiClient.get('/api/violations/types'),
  createStudentViolation: (data) =>
    apiClient.post('/api/violations/student-violations', data)
}
