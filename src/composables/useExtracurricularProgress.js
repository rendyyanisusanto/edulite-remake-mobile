import { ref } from 'vue'
import { extracurricularApi } from '@/api/extracurricular.api'

export function useExtracurricularProgress() {
  const loading = ref(false)
  const submitting = ref(false)
  const errorMessage = ref('')

  function parseError(error, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    )
  }

  async function runWithLoading(fn, fallbackMessage) {
    loading.value = true
    errorMessage.value = ''
    try {
      return await fn()
    } catch (error) {
      errorMessage.value = parseError(error, fallbackMessage)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function getProgressAspects(extracurricularId) {
    return runWithLoading(async () => {
      const { data } = await extracurricularApi.getProgressAspects(extracurricularId)
      return data?.data || []
    }, 'Gagal memuat aspek perkembangan')
  }

  async function getStudentProgress(params) {
    return runWithLoading(async () => {
      const { data } = await extracurricularApi.getStudentProgress(params)
      return data?.data?.items || data?.data || []
    }, 'Gagal memuat riwayat perkembangan')
  }

  async function createStudentProgress(payload) {
    submitting.value = true
    errorMessage.value = ''
    try {
      const { data } = await extracurricularApi.createStudentProgress(payload)
      return data?.data
    } catch (error) {
      errorMessage.value = parseError(error, 'Gagal menyimpan perkembangan')
      throw error
    } finally {
      submitting.value = false
    }
  }

  async function updateStudentProgress(id, payload) {
    submitting.value = true
    errorMessage.value = ''
    try {
      const { data } = await extracurricularApi.updateStudentProgress(id, payload)
      return data?.data
    } catch (error) {
      errorMessage.value = parseError(error, 'Gagal mengubah perkembangan')
      throw error
    } finally {
      submitting.value = false
    }
  }

  return {
    loading,
    submitting,
    errorMessage,
    parseError,
    getProgressAspects,
    getStudentProgress,
    createStudentProgress,
    updateStudentProgress
  }
}
