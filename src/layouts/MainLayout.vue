<template>
  <ion-page class="app-layout">
    <div class="app-content">
      <ion-router-outlet />
    </div>

    <!-- Custom Bottom Navigation (No Ionic Tabs to avoid double-render bugs) -->
    <div class="app-bottom-nav">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        class="nav-btn"
        :class="{ 'nav-btn--active': isActive(tab.route) }"
        @click="handleNav(tab)"
      >
        <div class="nav-icon-wrap" :class="{ 'nav-icon-wrap--active': isActive(tab.route) }">
          <ion-icon :name="isActive(tab.route) ? tab.iconActive : tab.icon" />
        </div>
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </div>

    <AppConfirmDialog
      :is-open="showLogoutDialog"
      title="Keluar dari Aplikasi"
      message="Apakah Anda yakin ingin keluar?"
      confirm-label="Ya, Keluar"
      cancel-label="Batal"
      confirm-color="danger"
      @confirm="confirmLogout"
      @cancel="showLogoutDialog = false"
    />
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { IonPage, IonRouterOutlet, IonIcon } from '@ionic/vue'
import { useAuthStore } from '@/store/auth.store'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showLogoutDialog = ref(false)

const tabs = [
  { name: 'profile', label: 'Profil', icon: 'person-outline', iconActive: 'person', route: '/app/profile' },
  { name: 'home', label: 'Beranda', icon: 'home-outline', iconActive: 'home', route: '/app/home' },
  { name: 'logout', label: 'Keluar', icon: 'log-out-outline', iconActive: 'log-out-outline', route: '#logout' }
]

function isActive(tabRoute) {
  if (tabRoute.startsWith('#')) return false
  return route.path.startsWith(tabRoute)
}

function handleNav(tab) {
  if (tab.route === '#logout') {
    showLogoutDialog.value = true
  } else {
    router.replace(tab.route)
  }
}

async function confirmLogout() {
  showLogoutDialog.value = false
  await authStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--color-background);
}

.app-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.app-bottom-nav {
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding-bottom: var(--safe-area-bottom);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
  z-index: 50;
  height: calc(56px + var(--safe-area-bottom));
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-tertiary);
  padding: 8px 0;
  transition: color var(--transition-fast);
}

.nav-btn--active {
  color: var(--color-primary);
}

.nav-icon-wrap {
  width: 44px;
  height: 28px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}

.nav-icon-wrap--active {
  background: var(--color-primary-subtle);
}

.nav-icon-wrap ion-icon {
  font-size: 22px;
}

.nav-label {
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.01em;
}
</style>
