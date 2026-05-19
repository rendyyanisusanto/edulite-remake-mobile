import apiClient from './axios'

export const classesApi = {
  getList: (params = {}) => apiClient.get('/api/academic/classes', { params })
}
