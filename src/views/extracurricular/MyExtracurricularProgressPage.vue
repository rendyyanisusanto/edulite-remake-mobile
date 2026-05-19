<template>
  <ion-page class="my-extracurricular-progress-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/extracurricular" text="" />
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Perkembangan Ekskul</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="page-header">
        <h1 class="header-title">Catatan Perkembangan</h1>
        <p class="header-subtitle">Ringkasan perkembangan nilai aktivitas ekstrakurikuler Anda.</p>
      </div>

      <div class="list-container" v-if="loading && items.length === 0">
        <AppSkeletonCard v-for="i in 4" :key="i" />
      </div>

      <AppEmptyState
        v-else-if="!loading && items.length === 0"
        icon="stats-chart-outline"
        title="Belum ada data perkembangan"
        description="Data perkembangan ekstrakurikuler belum tersedia."
      />

      <div v-else class="list-container">
        <AppListCard
          v-for="p in items"
          :key="p.id"
          :title="p.extracurricular?.name || 'Ekstrakurikuler'"
          :subtitle="`${p.aspect?.name || 'Aspek'} • ${formatDate(p.progress_date)}`"
          :meta="`Nilai ${p.score || '-'}`"
          icon="stats-chart-outline"
          :show-arrow="false"
        />
      </div>

      <div class="bottom-spacer" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue'
import AppListCard from '@/components/common/AppListCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import { extracurricularApi } from '@/api/extracurricular.api'

const loading = ref(false)
const items = ref([])

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function load() {
  loading.value = true
  try {
    const { data } = await extracurricularApi.getMyProgress()
    items.value = data?.data?.items || []
  } finally {
    loading.value = false
  }
}

async function handleRefresh(event) {
  await load()
  event.target.complete()
}

onMounted(load)
</script>

<style scoped>
.my-extracurricular-progress-page {
  --background: var(--color-background);
}

.modern-toolbar {
  --background: linear-gradient(135deg, var(--color-primary, #3b82f6) 0%, #1e40af 100%);
  --min-height: 56px;
}

.back-btn-wrapper {
  margin-left: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

ion-back-button {
  --color: #ffffff;
  --icon-font-size: 20px;
}

.modern-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.page-header {
  padding: 18px 16px 4px;
}

.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.header-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.list-container {
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bottom-spacer {
  height: 84px;
}
</style>
