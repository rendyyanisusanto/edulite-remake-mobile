import apiClient from './axios'

export const authApi = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  profile: () => apiClient.get('/api/auth/profile'),
  logout: () => Promise.resolve() // JWT — just clear token on client
}
