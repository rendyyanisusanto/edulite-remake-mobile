import axios from './axios'

export const mobileReportsApi = {
  // Students Search
  searchStudents: (q, limit = 20) => axios.get('/api/mobile/students/search', { params: { q, limit } }),

  // Violations
  submitViolation: (formData) => axios.post('/api/mobile/student-violations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyViolations: (page = 1, limit = 10) => axios.get('/api/mobile/student-violations/my', { params: { page, limit } }),
  getViolationDetail: (id) => axios.get(`/api/mobile/student-violations/${id}`),

  // Positive Points
  submitPositivePoint: (formData) => axios.post('/api/mobile/student-positive-points', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyPositivePoints: (page = 1, limit = 10) => axios.get('/api/mobile/student-positive-points/my', { params: { page, limit } }),
  getPositivePointDetail: (id) => axios.get(`/api/mobile/student-positive-points/${id}`)
}
