import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/store/auth.store'

const COACH_PROGRESS_ROLES = ['PELATIH_EKSKUL', 'GURU', 'SUPERADMIN', 'ADMIN', 'KESISWAAN', 'STAFF_KESISWAAN', 'STAFF KESISWAAN']

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
        path: 'students/:id',
        name: 'StudentDetail',
        component: () => import('@/views/students/StudentDetailPage.vue')
      },
      {
        path: 'student-item-deposits',
        name: 'StudentItemDepositsMobile',
        component: () => import('@/views/student-item-deposits/StudentItemDepositsPage.vue')
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
      },
      {
        path: 'reports',
        name: 'MyReports',
        component: () => import('@/views/reports/MyReportsPage.vue')
      },
      {
        path: 'reports/new',
        name: 'ReportForm',
        component: () => import('@/views/reports/ReportFormPage.vue')
      },
      {
        path: 'reports/:type/:id',
        name: 'ReportDetail',
        component: () => import('@/views/reports/ReportDetailPage.vue')
      },
      {
        path: 'permission-letters',
        name: 'PermissionLetters',
        component: () => import('@/views/permission-letters/PermissionLetterList.vue')
      },
      {
        path: 'permission-letters/new',
        name: 'PermissionLetterForm',
        component: () => import('@/views/permission-letters/PermissionLetterForm.vue')
      },
      {
        path: 'permission-letters/:id',
        name: 'PermissionLetterDetail',
        component: () => import('@/views/permission-letters/PermissionLetterDetail.vue')
      },
      {
        path: 'permission-letters/:id/edit',
        name: 'PermissionLetterEdit',
        component: () => import('@/views/permission-letters/PermissionLetterForm.vue')
      },
      {
        path: 'extracurricular',
        name: 'MyExtracurricular',
        component: () => import('@/views/extracurricular/MyExtracurricularPage.vue'),
        meta: { requiredPermissions: ['extracurricular.my.view'] }
      },
      {
        path: 'extracurricular/:id',
        name: 'ExtracurricularDetail',
        component: () => import('@/views/extracurricular/ExtracurricularDetailPage.vue'),
        meta: { requiredPermissions: ['extracurricular.my.view'], requiredRoles: COACH_PROGRESS_ROLES }
      },
      {
        path: 'extracurricular/:id/members',
        name: 'ExtracurricularMembers',
        component: () => import('@/views/extracurricular/ExtracurricularMembersPage.vue'),
        meta: { requiredPermissions: ['extracurricular.my.view'], requiredRoles: COACH_PROGRESS_ROLES }
      },
      {
        path: 'extracurricular/:id/students/:studentId/progress',
        name: 'StudentProgressList',
        component: () => import('@/views/extracurricular/StudentProgressListPage.vue'),
        meta: { requiredPermissions: ['extracurricular.my.view'], requiredRoles: COACH_PROGRESS_ROLES }
      },
      {
        path: 'extracurricular/:id/students/:studentId/progress/new',
        name: 'StudentProgressCreate',
        component: () => import('@/views/extracurricular/StudentProgressFormPage.vue'),
        meta: {
          requiredPermissions: ['extracurricular.my.view', 'extracurricular.progress.create'],
          requiredRoles: COACH_PROGRESS_ROLES
        }
      },
      {
        path: 'extracurricular/:id/students/:studentId/progress/:progressId/edit',
        name: 'StudentProgressEdit',
        component: () => import('@/views/extracurricular/StudentProgressFormPage.vue'),
        meta: {
          requiredPermissions: ['extracurricular.my.view', 'extracurricular.progress.update'],
          requiredRoles: COACH_PROGRESS_ROLES
        }
      },
      {
        path: 'extracurricular/attendances/my',
        name: 'MyExtracurricularAttendances',
        component: () => import('@/views/extracurricular/MyExtracurricularAttendancesPage.vue')
      },
      {
        path: 'extracurricular/sessions/today',
        name: 'CoachSessionsToday',
        component: () => import('@/views/extracurricular/CoachSessionsTodayPage.vue')
      },
      {
        path: 'extracurricular/sessions/:id/attendance',
        name: 'CoachSessionAttendance',
        component: () => import('@/views/extracurricular/CoachSessionAttendancePage.vue')
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

  const requiredPermissions = to.meta?.requiredPermissions || []
  if (requiredPermissions.length > 0) {
    const userPermissions = authStore.permissions || []
    const isSuperPermission = userPermissions.includes('*')
    const hasAllPermissions = requiredPermissions.every((permissionCode) => userPermissions.includes(permissionCode))

    if (!isSuperPermission && !hasAllPermissions) {
      return next({ name: 'Home' })
    }
  }

  const requiredRoles = to.meta?.requiredRoles || []
  if (requiredRoles.length > 0) {
    const userRoles = authStore.roles || []
    const hasAllowedRole = userRoles.some((role) => requiredRoles.includes(role))
    if (!hasAllowedRole) {
      return next({ name: 'Home' })
    }
  }

  return next()
})

export default router
