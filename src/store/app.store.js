import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(false)
  const networkError = ref(false)

  // Dynamic menu items definition — ready for backend integration
  // Each item: { id, title, subtitle, icon, route, permission, color }
  const menuDefinitions = [
    {
      id: 'students',
      title: 'Siswa',
      subtitle: 'Data & profil siswa',
      icon: 'people-outline',
      route: '/app/students',
      permission: 'students.view',
      color: '#3B82F6'
    },
    {
      id: 'violations',
      title: 'Pelanggaran',
      subtitle: 'Catatan pelanggaran',
      icon: 'alert-circle-outline',
      route: '/app/violations',
      permission: 'violations.view',
      color: '#EF4444'
    },
    {
      id: 'positive',
      title: 'Perilaku Positif',
      subtitle: 'Catatan positif siswa',
      icon: 'star-outline',
      route: '/app/positive-behaviour',
      permission: 'positive_points.view',
      color: '#10B981'
    },
    {
      id: 'counseling',
      title: 'Konseling',
      subtitle: 'Kasus & sesi BK',
      icon: 'chatbubbles-outline',
      route: '/app/counseling',
      permission: 'counseling_cases.view',
      color: '#8B5CF6'
    },
    {
      id: 'achievements',
      title: 'Prestasi',
      subtitle: 'Data prestasi siswa',
      icon: 'trophy-outline',
      route: '/app/achievements',
      permission: 'achievements.view',
      color: '#F59E0B'
    },
    {
      id: 'permission-letters',
      title: 'Surat Izin',
      subtitle: 'Perizinan kegiatan',
      icon: 'document-text-outline',
      route: '/app/permission-letters',
      permission: 'permission_letters.view',
      color: '#06B6D4'
    }
  ]

  function setLoading(val) { isLoading.value = val }
  function setNetworkError(val) { networkError.value = val }

  return {
    isLoading, networkError, menuDefinitions,
    setLoading, setNetworkError
  }
})
