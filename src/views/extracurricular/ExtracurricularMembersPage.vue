<template>
  <ion-page class="members-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button :default-href="`/app/extracurricular/${extracurricularId}`" text="" />
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Anggota Ekskul</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="page-header">
        <h1 class="header-title">{{ extracurricularName }}</h1>
        <p class="header-subtitle">Pilih siswa anggota untuk melihat perkembangan.</p>
      </div>

      <div class="search-wrap">
        <AppSearchBar
          v-model="keyword"
          placeholder="Cari nama siswa atau NIS..."
        />
      </div>

      <div v-if="loading && members.length === 0" class="list-container">
        <AppSkeletonCard v-for="i in 6" :key="i" />
      </div>

      <AppEmptyState
        v-else-if="!loading && hasError"
        icon="alert-circle-outline"
        title="Gagal memuat anggota"
        :description="errorMessage"
        action-label="Coba Lagi"
        @action="load"
      />

      <AppEmptyState
        v-else-if="!loading && filteredMembers.length === 0 && members.length === 0"
        icon="people-outline"
        title="Belum ada anggota aktif"
        description="Belum ada data anggota aktif pada ekskul ini."
      />

      <AppEmptyState
        v-else-if="!loading && filteredMembers.length === 0"
        icon="search-outline"
        title="Siswa tidak ditemukan"
        description="Coba kata kunci yang berbeda."
      />

      <div v-else class="list-container">
        <AppListCard
          v-for="member in filteredMembers"
          :key="member.id"
          :title="member.student?.full_name || '-'"
          :subtitle="member.student?.nis ? `NIS ${member.student.nis}` : 'NIS -'"
          :meta="member.status || 'ACTIVE'"
          :avatar="member.student?.full_name || 'Siswa'"
          accent="#10b981"
          @click="openStudentProgress(member)"
        />
      </div>

      <div class="bottom-spacer" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import { extracurricularApi } from '@/api/extracurricular.api'
import AppListCard from '@/components/common/AppListCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'

const route = useRoute()
const router = useRouter()
const extracurricularId = route.params.id

const loading = ref(false)
const hasError = ref(false)
const errorMessage = ref('Terjadi kesalahan saat memuat data anggota.')
const keyword = ref('')
const members = ref([])
const extracurricularName = ref('Daftar Anggota')

const filteredMembers = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return members.value

  return members.value.filter((member) => {
    const fullName = String(member.student?.full_name || '').toLowerCase()
    const nis = String(member.student?.nis || '').toLowerCase()
    return fullName.includes(q) || nis.includes(q)
  })
})

function parseError(err, fallback = 'Terjadi kesalahan saat memuat data anggota.') {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback
}

function openStudentProgress(member) {
  router.push(`/app/extracurricular/${extracurricularId}/students/${member.student_id}/progress`)
}

async function load() {
  loading.value = true
  hasError.value = false
  try {
    const [detailRes, membersRes] = await Promise.all([
      extracurricularApi.getMyExtracurricularDetail(extracurricularId),
      extracurricularApi.getExtracurricularMembers(extracurricularId, { status: 'ACTIVE', limit: 200 })
    ])

    extracurricularName.value = detailRes?.data?.data?.name || 'Daftar Anggota'
    members.value = membersRes?.data?.data?.items || membersRes?.data?.data || []
  } catch (err) {
    hasError.value = true
    errorMessage.value = parseError(err)
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
.members-page {
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
  padding: 18px 16px 6px;
}

.header-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.header-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.search-wrap {
  padding-top: 6px;
}

.list-container {
  padding: 6px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bottom-spacer {
  height: 84px;
}
</style>
