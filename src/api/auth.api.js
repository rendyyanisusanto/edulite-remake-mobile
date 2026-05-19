import apiClient from './axios'

export const authApi = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials, { params: { platform: 'mobile' } }),
  profile: () => apiClient.get('/api/auth/profile', { params: { platform: 'mobile' } }),
  logout: () => Promise.resolve() // JWT: just clear token on client
}
