<template>
  <div class="menu-grid">
    <AppMenuCard
      v-for="item in visibleMenuItems"
      :key="item.id"
      :title="item.title"
      :subtitle="item.subtitle"
      :icon="item.icon"
      :color="item.color"
      @click="navigateTo(item.route)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'
import AppMenuCard from './AppMenuCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// Filter menus by user permissions, with role fallback for minimal access scenarios.
const visibleMenuItems = computed(() => {
  const perms = authStore.permissions || []
  const roles = authStore.roles || []

  return appStore.menuDefinitions.filter((item) => {
    const requiredPermissions = Array.isArray(item.permissions)
      ? item.permissions
      : (item.permission ? [item.permission] : [])

    const requiredRoles = Array.isArray(item.roles) ? item.roles : []

    if (perms.includes('*')) return true

    const hasPermission = requiredPermissions.length > 0
      ? requiredPermissions.some((code) => perms.includes(code))
      : false

    if (hasPermission) return true

    const hasRoleFallback = requiredRoles.length > 0
      ? roles.some((role) => requiredRoles.includes(role))
      : false

    return hasRoleFallback
  })
})

function navigateTo(route) {
  router.push(route)
}
</script>

<style scoped>
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px 8px;
  padding: 16px 16px 32px;
  align-items: start;
}
</style>
