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

// Filter menus by user permissions — RBAC-ready
// NOTE: Temporarily showing all menus for development since permissions might not be seeded
const visibleMenuItems = computed(() => {
  return appStore.menuDefinitions
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
