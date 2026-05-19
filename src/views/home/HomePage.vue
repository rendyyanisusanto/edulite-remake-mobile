<template>
  <ion-page class="home-page">
    <ion-content :fullscreen="true" :scroll-events="true">
      <!-- Pull to refresh -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-icon="chevron-down-circle-outline"
          refreshing-spinner="crescent"
        />
      </ion-refresher>

      <!-- Top padding for safe area -->
      <div class="home-safe-top" />

      <!-- Profile Card -->
      <AppProfileCard
        :name="authStore.userName"
        :role="primaryRoleLabel"
        :photo="authStore.userPhoto"
        :school="appStore.schoolShortName"
      />

      <!-- Smart Attendance Card -->
      <DashboardAttendanceCard />

      <!-- Menu Section -->
      <AppSectionTitle
        title="Menu Utama"
        icon="grid-outline"
      />

      <AppMenuGrid />

      <!-- Bottom spacer for nav bar -->
      <div class="home-bottom-spacer" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import {
  IonPage,
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue'
import { useAuthStore } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'
import AppProfileCard from '@/components/common/AppProfileCard.vue'
import DashboardAttendanceCard from '@/components/cards/DashboardAttendanceCard.vue'
import AppMenuGrid from '@/components/cards/AppMenuGrid.vue'
import AppSectionTitle from '@/components/common/AppSectionTitle.vue'

const authStore = useAuthStore()
const appStore = useAppStore()

const ROLE_LABELS = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  GURU: 'Guru',
  PELATIH_EKSKUL: 'Pelatih Ekskul',
  SISWA: 'Siswa',
  ORTU: 'Orang Tua'
}

const primaryRoleLabel = computed(() => {
  const role = authStore.roles?.[0] || ''
  return ROLE_LABELS[role] || role || 'Pengguna'
})

// Note: Attendance logic moved to DashboardAttendanceCard / store

async function handleRefresh(event) {
  await authStore.fetchProfile()
  // Trigger any globally needed refresh here if desired
  event.target.complete()
}
</script>

<style scoped>
.home-page {
  --background: var(--color-background);
}

.home-safe-top {
  height: calc(var(--safe-area-top) + 12px);
}



.home-bottom-spacer {
  height: 80px;
}
</style>
