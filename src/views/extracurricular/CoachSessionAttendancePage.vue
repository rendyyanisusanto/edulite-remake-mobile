<template>
  <ion-page class="coach-attendance-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/extracurricular/sessions/today" text="" />
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Absensi Siswa</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="page-header">
        <h1 class="header-title">Isi Kehadiran</h1>
        <p class="header-subtitle">Tombol cepat: M (Masuk), S (Sakit), I (Izin), A (Alfa).</p>
      </div>

      <div v-if="rows.length > 0" class="quick-bar">
        <div class="quick-stat">
          <span class="stat-label">Progress Cepat</span>
          <span class="stat-value">Siswa {{ activeIndex + 1 }} dari {{ rows.length }}</span>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
          </div>
        </div>
        <div class="quick-switch-wrap">
          <span class="switch-label">Mode Cepat</span>
          <button type="button" class="quick-toggle" :class="{ active: quickMode }" @click="toggleQuickMode">
            {{ quickMode ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>

      <div class="legend-wrap">
        <span class="legend-item legend-m">M Masuk</span>
        <span class="legend-item legend-s">S Sakit</span>
        <span class="legend-item legend-i">I Izin</span>
        <span class="legend-item legend-a">A Alfa</span>
      </div>

      <div v-if="loading && rows.length === 0" class="list-container">
        <AppSkeletonCard v-for="i in 6" :key="i" />
      </div>

      <AppEmptyState
        v-else-if="!loading && rows.length === 0"
        icon="people-outline"
        title="Belum ada data siswa"
        description="Siswa anggota pada sesi ini belum tersedia."
      />

      <div v-else class="list-container">
        <div
          v-for="(row, index) in rows"
          :key="row.student_id"
          class="student-card"
          :class="{ 'is-active': quickMode && index === activeIndex }"
          :ref="(el) => setRowRef(el, index)"
          @click="focusIndex(index)"
        >
          <div class="student-main">
            <div class="student-head">
              <span class="student-no">{{ index + 1 }}</span>
              <p class="student-name">{{ row.student?.full_name || '-' }}</p>
            </div>
            <p class="student-subtitle">NIS {{ row.student?.nis || '-' }}</p>
          </div>

          <div class="status-buttons">
            <button
              v-for="option in options"
              :key="option.label"
              type="button"
              class="status-btn"
              :class="[option.className, row.attendanceStatus === option.value ? 'active' : '']"
              @click.stop="setAttendance(row, index, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="action-wrap">
        <ion-button expand="block" class="save-btn" @click="save" :disabled="saving || rows.length === 0">
          {{ saving ? 'Menyimpan...' : 'Simpan Presensi' }}
        </ion-button>
      </div>

      <div class="bottom-spacer" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, nextTick, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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
  toastController
} from '@ionic/vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import { extracurricularApi } from '@/api/extracurricular.api'

const route = useRoute()
const sessionId = route.params.id

const loading = ref(false)
const saving = ref(false)
const rows = ref([])
const quickMode = ref(true)
const activeIndex = ref(0)
const rowRefs = ref([])

const options = [
  { label: 'M', value: 'PRESENT', className: 'btn-m' },
  { label: 'S', value: 'SICK', className: 'btn-s' },
  { label: 'I', value: 'PERMIT', className: 'btn-i' },
  { label: 'A', value: 'ABSENT', className: 'btn-a' }
]

const progressPercent = computed(() => {
  if (!rows.value.length) return 0
  return Math.round(((activeIndex.value + 1) / rows.value.length) * 100)
})

function normalizeStatus(status) {
  if (!status) return 'PRESENT'
  if (status === 'EXCUSED') return 'PERMIT'
  if (status === 'LATE') return 'PRESENT'
  if (status === 'PERMIT') return 'PERMIT'
  if (status === 'SICK') return 'SICK'
  if (status === 'PRESENT') return 'PRESENT'
  return 'ABSENT'
}

function setRowRef(el, index) {
  if (el) rowRefs.value[index] = el
}

function scrollToIndex(index) {
  nextTick(() => {
    const target = rowRefs.value[index]
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function focusIndex(index) {
  activeIndex.value = index
  if (quickMode.value) scrollToIndex(index)
}

function toggleQuickMode() {
  quickMode.value = !quickMode.value
  if (quickMode.value) scrollToIndex(activeIndex.value)
}

function setAttendance(row, index, value) {
  row.attendanceStatus = value
  row._marked = true
  activeIndex.value = index

  if (!quickMode.value) return

  const nextIndex = index + 1
  if (nextIndex < rows.value.length) {
    activeIndex.value = nextIndex
    scrollToIndex(nextIndex)
  }
}

function getFirstActiveIndex() {
  const idx = rows.value.findIndex((row) => !row._marked)
  return idx === -1 ? 0 : idx
}

function parseErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  )
}

async function toast(message, color = 'success') {
  const t = await toastController.create({ message, duration: 1500, color })
  await t.present()
}

async function load() {
  loading.value = true
  rowRefs.value = []
  try {
    const { data } = await extracurricularApi.getSessionAttendances(sessionId)
    rows.value = (data?.data || []).map((r) => {
      const normalized = normalizeStatus(r.attendance?.attendance_status)
      return {
        ...r,
        attendanceStatus: normalized,
        _marked: true
      }
    })
    activeIndex.value = getFirstActiveIndex()
    if (quickMode.value && rows.value.length > 0) scrollToIndex(activeIndex.value)
  } catch (err) {
    await toast(parseErrorMessage(err, 'Gagal memuat data presensi'), 'danger')
  } finally {
    loading.value = false
  }
}

async function handleRefresh(event) {
  await load()
  event.target.complete()
}

async function save() {
  saving.value = true
  try {
    await extracurricularApi.bulkSessionAttendances(
      sessionId,
      rows.value.map((r) => ({ student_id: r.student_id, attendance_status: r.attendanceStatus }))
    )
    await toast('Presensi berhasil disimpan')
  } catch (err) {
    await toast(parseErrorMessage(err, 'Gagal menyimpan presensi'), 'danger')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.coach-attendance-page {
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

.quick-bar {
  margin: 10px 16px 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #dbeafe;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.08);
}

.quick-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.progress-track {
  margin-top: 2px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.quick-switch-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.switch-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.quick-toggle {
  border: 1px solid #93c5fd;
  color: #1d4ed8;
  background: #eff6ff;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  min-width: 60px;
}

.quick-toggle.active {
  background: #1d4ed8;
  color: #ffffff;
  border-color: #1d4ed8;
}

.legend-wrap {
  padding: 10px 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-item {
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 4px 10px;
}

.legend-m {
  color: #166534;
  background: #dcfce7;
}

.legend-s {
  color: #1d4ed8;
  background: #dbeafe;
}

.legend-i {
  color: #92400e;
  background: #fef3c7;
}

.legend-a {
  color: #991b1b;
  background: #fee2e2;
}

.list-container {
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.student-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

.student-card.is-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.student-main {
  min-width: 0;
  width: 100%;
}

.student-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-no {
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.student-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.35;
}

.student-subtitle {
  margin: 3px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.status-buttons {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  width: 100%;
}

.status-btn {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 13px;
  font-weight: 800;
  color: #374151;
  transition: all 0.15s ease;
}

.status-btn.active {
  color: #ffffff;
  border-color: transparent;
}

.status-btn.btn-m.active {
  background: #16a34a;
}

.status-btn.btn-s.active {
  background: #2563eb;
}

.status-btn.btn-i.active {
  background: #d97706;
}

.status-btn.btn-a.active {
  background: #dc2626;
}

.action-wrap {
  padding: 16px 16px 0;
}

.save-btn {
  --background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  --border-radius: 12px;
  font-weight: 700;
}

.bottom-spacer {
  height: 84px;
}
</style>
