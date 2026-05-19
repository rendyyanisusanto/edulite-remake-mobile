import apiClient from './axios'

export const studentItemDepositApi = {
  getMyItems: (params = {}) => apiClient.get('/api/mobile/student-item-deposits/my-items', { params }),
  getMyLoans: (params = {}) => apiClient.get('/api/mobile/student-item-deposits/my-loans', { params }),
  getActiveItems: (params = {}) => apiClient.get('/api/mobile/student-item-deposits/active-items', { params }),
  returnDaily: (depositId, payload = {}) => apiClient.post(`/api/student-item-deposits/${depositId}/return-daily`, payload),
  finalReturn: (depositId, payload = {}) => apiClient.post(`/api/student-item-deposits/${depositId}/final-return`, payload)
}
