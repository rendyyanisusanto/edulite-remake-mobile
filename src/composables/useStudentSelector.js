import { ref, watch } from 'vue'
import { mobileReportsApi } from '@/api/mobileReports.api'

export function useStudentSelector() {
  const isSearching = ref(false)
  const students = ref([])
  const searchQuery = ref('')

  const searchStudents = async (query = '') => {
    isSearching.value = true
    try {
      const res = await mobileReportsApi.searchStudents(query)
      students.value = res.data?.data || []
    } catch (e) {
      console.error('Failed searching students:', e)
      students.value = []
    } finally {
      isSearching.value = false
    }
  }

  // Auto search when query changes, with simple debounce emulation
  let timeout
  watch(searchQuery, (newQ) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      searchStudents(newQ)
    }, 300)
  })

  return {
    isSearching,
    students,
    searchQuery,
    searchStudents
  }
}
