import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { schoolApi } from '@/api/school.api'

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(false)
  const networkError = ref(false)
  const schoolProfile = ref(null)

  const schoolName = computed(() => schoolProfile.value?.name || 'Edulite')
  const schoolShortName = computed(() => schoolProfile.value?.short_name || 'Edulite')
  const schoolLogo = computed(() => schoolProfile.value?.logo || null)
  const schoolIcon = computed(() => schoolProfile.value?.school_icon || null)

  // Dynamic menu items definition - ready for backend integration
  // Each item: { id, title, subtitle, icon, route, permissions, roles, color }
  const menuDefinitions = [
    {
      id: 'students',
      title: 'Siswa',
      subtitle: 'Data & profil siswa',
      icon: 'people-outline',
      route: '/app/students',
      permissions: ['student.view'],
      color: '#3B82F6'
    },
    {
      id: 'violations',
      title: 'Pelanggaran',
      subtitle: 'Catatan pelanggaran',
      icon: 'alert-circle-outline',
      route: '/app/violations',
      permissions: ['student_violation.view', 'violation.report.view_own', 'violation.report.create'],
      color: '#EF4444'
    },
    {
      id: 'positive',
      title: 'Perilaku Positif',
      subtitle: 'Catatan positif siswa',
      icon: 'star-outline',
      route: '/app/positive-behaviour',
      permissions: ['student_positive_point.view', 'positive_point.report.view_own', 'positive_point.report.create'],
      color: '#10B981'
    },
    {
      id: 'counseling',
      title: 'Konseling',
      subtitle: 'Kasus & sesi BK',
      icon: 'chatbubbles-outline',
      route: '/app/counseling',
      permissions: ['counseling_case.view'],
      color: '#8B5CF6'
    },
    {
      id: 'achievements',
      title: 'Prestasi',
      subtitle: 'Data prestasi siswa',
      icon: 'trophy-outline',
      route: '/app/achievements',
      permissions: ['achievement.view'],
      color: '#F59E0B'
    },
    {
      id: 'quick-report',
      title: 'Lapor Cepat',
      subtitle: 'Riwayat & input lapangan',
      icon: 'megaphone-outline',
      route: '/app/reports',
      permissions: ['violation.report.create', 'positive_point.report.create'],
      roles: ['GURU', 'GURU_BK'],
      color: '#F43F5E'
    },
    {
      id: 'permission-letters',
      title: 'Surat Izin',
      subtitle: 'Perizinan kegiatan',
      icon: 'document-text-outline',
      route: '/app/permission-letters',
      permissions: ['permission_letter.view'],
      color: '#06B6D4'
    },
    {
      id: 'my-extracurricular',
      title: 'Ekskul Saya',
      subtitle: 'Ekskul, anggota, progres',
      icon: 'football-outline',
      route: '/app/extracurricular',
      permissions: ['extracurricular.my.view'],
      color: '#F97316'
    },
    {
      id: 'coach-session-today',
      title: 'Sesi Ekskul',
      subtitle: 'Kelola sesi hari ini',
      icon: 'calendar-outline',
      route: '/app/extracurricular/sessions/today',
      permissions: ['extracurricular.session.view'],
      color: '#22C55E'
    }
  ]

  function setLoading(val) { isLoading.value = val }
  function setNetworkError(val) { networkError.value = val }

  async function fetchSchoolProfile() {
    isLoading.value = true
    try {
      const { data } = await schoolApi.getPublicProfile()
      if (data.success) {
        schoolProfile.value = data.data
      }
    } catch (err) {
      console.error('Failed to fetch school profile:', err)
      setNetworkError(true)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading, networkError, menuDefinitions, schoolProfile,
    schoolName, schoolShortName, schoolLogo, schoolIcon,
    setLoading, setNetworkError, fetchSchoolProfile
  }
})
