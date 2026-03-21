import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const roles = ref([])
  const permissions = ref([])
  const token = ref(localStorage.getItem('access_token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userRoles = computed(() => roles.value)
  const hasPermission = computed(() => (code) => {
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(code)
  })
  const primaryRole = computed(() => roles.value[0] || 'User')

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authApi.login(credentials)
      if (data.success) {
        setAuth(data.data)
        return { success: true }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please try again.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    try {
      const { data } = await authApi.profile()
      if (data.success) {
        user.value = data.data.user
        roles.value = data.data.roles
        permissions.value = data.data.permissions
      }
    } catch (err) {
      clearAuth()
    }
  }

  function setAuth(data) {
    token.value = data.access_token
    user.value = data.user
    roles.value = data.roles
    permissions.value = data.permissions
    localStorage.setItem('access_token', data.access_token)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    roles.value = []
    permissions.value = []
    error.value = null
    localStorage.removeItem('access_token')
  }

  async function logout() {
    clearAuth()
  }

  // Restore session from token on startup
  async function restoreSession() {
    if (token.value && !user.value) {
      await fetchProfile()
    }
  }

  return {
    user, roles, permissions, token, loading, error,
    isAuthenticated, userName, userEmail, userRoles,
    hasPermission, primaryRole,
    login, logout, fetchProfile, clearAuth, restoreSession, setAuth
  }
})
