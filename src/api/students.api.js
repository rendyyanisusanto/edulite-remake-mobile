import apiClient from './axios'

export const studentsApi = {
  getList: (params = {}) => apiClient.get('/api/students', { params }),
  getById: (id) => apiClient.get(`/api/students/${id}`)
}
