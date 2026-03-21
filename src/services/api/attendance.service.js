import api from '@/api/axios'

class AttendanceService {
  /**
   * Get today's attendance info (setting, shift, and existing attendance record)
   */
  async getTodayInfo() {
    return api.get('/attendance/mobile/today')
  }

  /**
   * Clock in
   * @param {Object} payload { latitude, longitude, accuracy, distance_meters, status, note }
   */
  async clockIn(payload) {
    return api.post('/attendance/mobile/clock-in', payload)
  }

  /**
   * Clock out
   * @param {Object} payload { latitude, longitude, accuracy, distance_meters, status, note }
   */
  async clockOut(payload) {
    return api.post('/attendance/mobile/clock-out', payload)
  }

  /**
   * Get attendance history
   * @param {Object} params { page, limit, month }
   */
  async getHistory(params = {}) {
    return api.get('/attendance/mobile/history', { params })
  }

  /**
   * Get attendance detail
   */
  async getAttendanceDetail(id) {
    return api.get(`/attendance/mobile/history/${id}`)
  }

  /**
   * Get my requests
   * @param {Object} params { page, limit, request_status }
   */
  async getMyRequests(params = {}) {
    return api.get('/attendance/mobile/requests', { params })
  }

  /**
   * Get request detail
   */
  async getRequestDetail(id) {
    return api.get(`/attendance/mobile/requests/${id}`)
  }

  /**
   * Create an attendance request
   * @param {Object} payload 
   */
  async createRequest(payload) {
    return api.post('/attendance/mobile/requests', payload)
  }
}

export default new AttendanceService()
