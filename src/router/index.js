import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/store/auth.store'

const routes = [
  {
    path: '/',
    redirect: '/app/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/app',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/app/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/HomePage.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfilePage.vue')
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/students/StudentsPage.vue')
      },
      {
        path: 'violations',
        name: 'Violations',
        component: () => import('@/views/violations/ViolationsPage.vue')
      },
      {
        path: 'positive-behaviour',
        name: 'PositiveBehaviour',
        component: () => import('@/views/positive-behaviour/PositiveBehaviourPage.vue')
      },
      {
        path: 'counseling',
        name: 'Counseling',
        component: () => import('@/views/counseling/CounselingPage.vue')
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/views/attendance/AttendanceIndex.vue')
      },
      {
        path: 'attendance/history',
        name: 'AttendanceHistory',
        component: () => import('@/views/attendance/AttendanceHistory.vue')
      },
      {
        path: 'attendance/history/:id',
        name: 'AttendanceDetail',
        component: () => import('@/views/attendance/AttendanceDetail.vue')
      },
      {
        path: 'attendance/requests',
        name: 'AttendanceRequests',
        component: () => import('@/views/attendance/AttendanceRequestList.vue')
      },
      {
        path: 'attendance/requests/new',
        name: 'AttendanceRequestForm',
        component: () => import('@/views/attendance/AttendanceRequestForm.vue')
      },
      {
        path: 'attendance/requests/:id',
        name: 'AttendanceRequestDetail',
        component: () => import('@/views/attendance/AttendanceRequestDetail.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/app/home'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Restore session on first load
  if (!authStore.user && authStore.token) {
    await authStore.restoreSession()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' })
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'Home' })
  }

  return next()
})

export default router
