import { defineStore } from 'pinia'
import attendanceService from '@/services/api/attendance.service'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    todayInfo: null, // { setting, shift, attendance }
    loading: false,
    error: null,
  }),
  
  getters: {
    hasClockedIn: (state) => !!state.todayInfo?.attendance?.clock_in_at,
    hasClockedOut: (state) => !!state.todayInfo?.attendance?.clock_out_at,
    clockInTime: (state) => state.todayInfo?.attendance?.clock_in_at || null,
    clockOutTime: (state) => state.todayInfo?.attendance?.clock_out_at || null,
    todayStatus: (state) => state.todayInfo?.attendance?.attendance_status || 'Belum Absen',
    activeSetting: (state) => state.todayInfo?.setting || null,
    activeShift: (state) => state.todayInfo?.shift || null,
  },
  
  actions: {
    async fetchTodayInfo() {
      this.loading = true
      this.error = null
      try {
        const res = await attendanceService.getTodayInfo()
        if (res?.data) {
          this.todayInfo = res.data
        }
      } catch (err) {
        this.error = err?.response?.data?.message || err.message || 'Gagal mengambil data absensi.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async clockIn(locationPayload) {
      try {
        const res = await attendanceService.clockIn(locationPayload)
        // Refresh info after clock in
        await this.fetchTodayInfo()
        return res
      } catch (err) {
        throw err
      }
    },

    async clockOut(locationPayload) {
      try {
        const res = await attendanceService.clockOut(locationPayload)
        // Refresh info after clock out
        await this.fetchTodayInfo()
        return res
      } catch (err) {
        throw err
      }
    }
  }
})
