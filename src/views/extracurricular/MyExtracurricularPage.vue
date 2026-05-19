<template>
  <ion-page class="my-extracurricular-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/home" text="" />
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Ekstrakurikuler</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="page-header">
        <h1 class="header-title">Ekskul Saya</h1>
        <p class="header-subtitle">Lihat daftar ekskul yang terhubung dengan akun Anda.</p>
      </div>

      <div class="list-container" v-if="loading && items.length === 0">
        <AppSkeletonCard v-for="i in 4" :key="i" />
      </div>

      <AppEmptyState
        v-else-if="!loading && hasError"
        icon="alert-circle-outline"
        title="Gagal memuat ekskul"
        :description="errorMessage"
        action-label="Coba Lagi"
        @action="load"
      />

      <AppEmptyState
        v-else-if="!loading && items.length === 0"
        icon="apps-outline"
        title="Belum Ada Ekskul"
        description="Belum ada ekskul yang terhubung ke akun ini."
      />

      <div v-else class="list-container">
        <AppListCard
          v-for="item in items"
          :key="item.id"
          :title="item.name"
          :subtitle="item.code || '-'"
          :meta="item.type || 'EKSKUL'"
          :avatar="item.name"
          accent="#3b82f6"
          @click="goDetail(item.id)"
        />
      </div>

      <div class="bottom-spacer" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const loading = ref(false)
const items = ref([])
const hasError = ref(false)
const errorMessage = ref('Terjadi kesalahan saat memuat ekskul.')

function goDetail(id) {
  router.push(`/app/extracurricular/${id}`)
}

async function load() {
  loading.value = true
  hasError.value = false
  try {
    const { data } = await extracurricularApi.getMyExtracurriculars()
    const raw = data?.data?.items || data?.data || []
    items.value = Array.isArray(raw) ? raw : []
  } catch (err) {
    hasError.value = true
    errorMessage.value = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Gagal memuat data ekskul'
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
.my-extracurricular-page {
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
  backdrop-filter: blur(4px);
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
  line-height: 1.45;
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
