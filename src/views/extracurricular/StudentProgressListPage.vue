<template>
  <ion-page class="progress-list-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button :default-href="`/app/extracurricular/${extracurricularId}/members`" text="" />
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Perkembangan Siswa</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="page-header">
        <h1 class="header-title">{{ studentName }}</h1>
        <p class="header-subtitle">{{ extracurricularName }}</p>
      </div>

      <div class="filter-card">
        <div class="field-group">
          <label class="field-label">Aspek</label>
          <ion-select v-model="filters.aspect_id" interface="action-sheet" class="field-select" placeholder="Semua Aspek" cancel-text="Batal">
            <ion-select-option value="">Semua Aspek</ion-select-option>
            <ion-select-option v-for="aspect in aspects" :key="aspect.id" :value="aspect.id">
              {{ aspect.name }}
            </ion-select-option>
          </ion-select>
        </div>

        <div class="date-row">
          <div class="field-group flex-1">
            <label class="field-label">Dari Tanggal</label>
            <input v-model="filters.date_from" type="date" class="native-date-input" />
          </div>
          <div class="field-group flex-1">
            <label class="field-label">Sampai Tanggal</label>
            <input v-model="filters.date_to" type="date" class="native-date-input" />
          </div>
        </div>

        <ion-button fill="outline" class="apply-filter-btn" @click="loadProgress" :disabled="loading">
          Terapkan Filter
        </ion-button>
      </div>

      <div class="action-wrap">
        <ion-button
          expand="block"
          class="add-btn"
          :disabled="aspects.length === 0"
          @click="openCreate"
        >
          Tambah Perkembangan
        </ion-button>
      </div>

      <div v-if="loading && progressItems.length === 0" class="list-container">
        <AppSkeletonCard v-for="i in 5" :key="i" />
      </div>

      <AppEmptyState
        v-else-if="!loading && hasError"
        icon="alert-circle-outline"
        title="Gagal memuat perkembangan"
        :description="errorMessage"
        action-label="Coba Lagi"
        @action="reloadAll"
      />

      <AppEmptyState
        v-else-if="!loading && aspects.length === 0"
        icon="layers-outline"
        title="Aspek perkembangan belum diatur oleh admin"
        description="Hubungi admin untuk menambahkan master aspek perkembangan pada ekskul ini."
      />

      <AppEmptyState
        v-else-if="!loading && progressItems.length === 0"
        icon="stats-chart-outline"
        title="Belum ada data perkembangan"
        description="Tekan tombol tambah untuk menginput perkembangan siswa."
      />

      <div v-else class="list-container">
        <div v-for="item in progressItems" :key="item.id" class="progress-card">
          <div class="progress-head">
            <h3 class="progress-title">{{ item.aspect?.name || 'Aspek tidak dipilih' }}</h3>
            <button class="edit-btn" type="button" @click="openEdit(item.id)">Edit</button>
          </div>
          <p class="progress-meta">
            {{ formatDate(item.progress_date) }} · {{ item.session?.session_title || 'Tanpa sesi' }}
          </p>
          <p class="progress-detail">
            Score: {{ item.score || '-' }} · Predikat: {{ item.predicate || '-' }} · Level: {{ item.level || '-' }}
          </p>
          <p v-if="item.note" class="progress-note">Catatan: {{ item.note }}</p>
          <p v-if="item.recommendation" class="progress-note">Rekomendasi: {{ item.recommendation }}</p>
        </div>
      </div>

      <div class="bottom-spacer" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
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
  IonRefresherContent,
  IonButton,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'
import { onIonViewWillEnter } from '@ionic/vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import { extracurricularApi } from '@/api/extracurricular.api'
import { useExtracurricularProgress } from '@/composables/useExtracurricularProgress'

const route = useRoute()
const router = useRouter()
const extracurricularId = route.params.id
const studentId = route.params.studentId

const extracurricularName = ref('Ekskul')
const studentName = ref('Siswa')
const aspects = ref([])
const progressItems = ref([])
const hasError = ref(false)
const errorMessage = ref('Terjadi kesalahan saat memuat data.')
const filters = ref({
  aspect_id: '',
  date_from: '',
  date_to: ''
})

const { loading, parseError, getProgressAspects, getStudentProgress } = useExtracurricularProgress()

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openCreate() {
  router.push(`/app/extracurricular/${extracurricularId}/students/${studentId}/progress/new`)
}

function openEdit(progressId) {
  router.push(`/app/extracurricular/${extracurricularId}/students/${studentId}/progress/${progressId}/edit`)
}

async function loadProgress() {
  hasError.value = false
  try {
    const params = {
      extracurricular_id: extracurricularId,
      student_id: studentId
    }
    if (filters.value.aspect_id) params.aspect_id = filters.value.aspect_id
    if (filters.value.date_from) params.date_from = filters.value.date_from
    if (filters.value.date_to) params.date_to = filters.value.date_to

    progressItems.value = await getStudentProgress(params)
  } catch (err) {
    hasError.value = true
    errorMessage.value = parseError(err, 'Gagal memuat riwayat perkembangan')
  }
}

async function reloadAll() {
  hasError.value = false
  try {
    const [detailRes, membersRes, aspectRows] = await Promise.all([
      extracurricularApi.getMyExtracurricularDetail(extracurricularId),
      extracurricularApi.getExtracurricularMembers(extracurricularId, { status: 'ACTIVE', limit: 250 }),
      getProgressAspects(extracurricularId)
    ])

    extracurricularName.value = detailRes?.data?.data?.name || 'Ekskul'
    const memberRows = membersRes?.data?.data?.items || membersRes?.data?.data || []
    const selectedMember = memberRows.find((row) => String(row.student_id) === String(studentId))
    studentName.value = selectedMember?.student?.full_name || 'Siswa'
    aspects.value = aspectRows

    await loadProgress()
  } catch (err) {
    hasError.value = true
    errorMessage.value = parseError(err, 'Gagal memuat data perkembangan siswa')
  }
}

async function handleRefresh(event) {
  await reloadAll()
  event.target.complete()
}

onMounted(reloadAll)
onIonViewWillEnter(reloadAll)
</script>

<style scoped>
.progress-list-page {
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

.filter-card {
  margin: 8px 16px 0;
  padding: 12px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.field-select {
  width: 100%;
  --padding-start: 12px;
  --padding-end: 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

.date-row {
  display: flex;
  gap: 8px;
}

.flex-1 {
  flex: 1;
}

.native-date-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #ffffff;
}

.apply-filter-btn {
  --border-color: #cbd5e1;
  --color: #334155;
  --border-radius: 10px;
  font-weight: 600;
}

.action-wrap {
  padding: 12px 16px 0;
}

.add-btn {
  --background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  --border-radius: 12px;
  font-weight: 700;
}

.list-container {
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.progress-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.edit-btn {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 8px;
  font-size: 12px;
  padding: 6px 10px;
  font-weight: 700;
}

.progress-meta {
  margin: 6px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.progress-detail {
  margin: 8px 0 0;
  font-size: 13px;
  color: #374151;
  line-height: 1.45;
}

.progress-note {
  margin: 6px 0 0;
  font-size: 13px;
  color: #334155;
  line-height: 1.4;
}

.bottom-spacer {
  height: 84px;
}
</style>
