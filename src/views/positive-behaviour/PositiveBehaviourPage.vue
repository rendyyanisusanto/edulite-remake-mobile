<template>
  <ion-page class="positive-page">
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="safe-top-pad" />

      <AppPageHeader title="Perilaku Positif" subtitle="Catatan perilaku positif siswa" />

      <div class="sticky-controls">
        <div class="premium-controls-card">
          <button class="filter-toggle" @click="isFilterOpen = !isFilterOpen">
            <div class="filter-toggle__left">
              <div class="filter-toggle__icon">
                <ion-icon :icon="filterOutline" />
              </div>
              <div class="filter-toggle__text">
                <p class="controls-heading__label">Filter</p>
                <h3 class="controls-heading__title">{{ activeFilterLabel }}</h3>
                <p class="controls-heading__caption">Kelas, siswa, dan tanggal</p>
              </div>
            </div>
            <ion-icon :icon="isFilterOpen ? chevronUpOutline : chevronDownOutline" class="filter-toggle__arrow" />
          </button>

          <div v-show="isFilterOpen" class="filter-panel">
            <div class="controls-divider"></div>

            <div class="filter-row">
              <span class="filter-label">Kelas</span>
              <ion-select
                v-model="selectedClass"
                interface="action-sheet"
                placeholder="Semua kelas"
                class="premium-select"
                cancel-text="Batal"
                @ionChange="handleClassChange"
              >
                <ion-select-option value="">Semua kelas</ion-select-option>
                <ion-select-option v-for="item in classOptions" :key="item.id" :value="String(item.id)">
                  {{ item.name }}
                </ion-select-option>
              </ion-select>
            </div>

            <div class="controls-divider"></div>

            <div class="filter-row">
              <span class="filter-label">Siswa</span>
              <ion-select
                v-model="selectedStudent"
                interface="action-sheet"
                placeholder="Semua siswa"
                class="premium-select"
                cancel-text="Batal"
              >
                <ion-select-option value="">Semua siswa</ion-select-option>
                <ion-select-option v-for="item in filteredStudentOptions" :key="item.id" :value="String(item.id)">
                  {{ item.full_name }}
                </ion-select-option>
              </ion-select>
            </div>

            <div class="controls-divider"></div>

            <div class="filter-row filter-row--date">
              <span class="filter-label">Tanggal</span>
              <input v-model="selectedDate" type="date" class="premium-date-input" />
            </div>

            <div class="controls-divider"></div>

            <button class="reset-button" @click="resetFilters">
              <ion-icon :icon="refreshOutline" />
              Reset ke hari ini
            </button>
          </div>
        </div>

        <div class="active-filters">
          <span class="active-filter-chip">{{ activeFilterLabel }}</span>
          <span v-if="selectedStudentName" class="active-filter-chip active-filter-chip--soft">
            {{ selectedStudentName }}
          </span>
        </div>
      </div>

      <div v-if="loading" class="list-container">
        <AppSkeletonCard v-for="i in 4" :key="i" />
      </div>

      <AppEmptyState
        v-else-if="filteredRecords.length === 0"
        icon="star-outline"
        title="Tidak ada perilaku positif"
        :description="emptyDescription"
      />

      <div v-else class="list-container">
        <div
          v-for="item in filteredRecords"
          :key="item.id"
          class="positive-card"
          @click="openDetail(item.id)"
        >
          <div class="positive-card__top">
            <div class="positive-card__avatar">
              <span>{{ getInitials(item.studentName) }}</span>
            </div>

            <div class="positive-card__main">
              <div class="positive-card__heading">
                <span class="positive-card__student">{{ item.studentName }}</span>
                <AppStatusBadge :status="item.status" :label="STATUS_LABELS[item.status] || item.statusLabel" />
              </div>
              <span class="positive-card__type">{{ item.typeName }}</span>
              <span class="positive-card__class">{{ item.className || 'Kelas belum tersedia' }}</span>
              <p v-if="item.description" class="positive-card__description">{{ item.description }}</p>
            </div>
          </div>

          <div class="positive-card__footer">
            <div class="positive-card__meta">
              <ion-icon :icon="calendarOutline" />
              <span>{{ formatDate(item.date) }}</span>
            </div>
            <div class="positive-card__meta" v-if="item.location">
              <ion-icon :icon="locationOutline" />
              <span>{{ item.location }}</span>
            </div>
            <div class="positive-card__points" v-if="item.point > 0">
              <ion-icon :icon="starOutline" />
              <span>+{{ item.point }} poin</span>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 100px;" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, onIonViewWillEnter } from '@ionic/vue'
import { calendarOutline, chevronDownOutline, chevronUpOutline, filterOutline, locationOutline, refreshOutline, starOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import { classesApi } from '@/api/classes.api'
import { mobileReportsApi } from '@/api/mobileReports.api'
import { studentsApi } from '@/api/students.api'

const router = useRouter()
const loading = ref(true)
const records = ref([])
const studentOptions = ref([])
const classOptions = ref([])
const isFilterOpen = ref(false)
const selectedClass = ref('')
const selectedStudent = ref('')
const selectedDate = ref(getTodayValue())

const STATUS_LABELS = {
  open: 'Terbuka',
  pending: 'Menunggu Review',
  resolved: 'Selesai',
  approved: 'Disetujui',
  pending_review: 'Menunggu Review',
  verified: 'Terverifikasi',
  unverified: 'Belum Verifikasi'
}

const studentLookup = computed(() => {
  return studentOptions.value.reduce((accumulator, item) => {
    accumulator[String(item.id)] = item
    return accumulator
  }, {})
})

const filteredStudentOptions = computed(() => {
  if (!selectedClass.value) return studentOptions.value
  return studentOptions.value.filter(item => String(item.class_id || '') === String(selectedClass.value))
})

const normalizedRecords = computed(() => {
  return records.value.map(item => {
    const studentId = String(item.student_id || item.student?.id || '')
    const studentInfo = studentLookup.value[studentId]
    const classId = String(
      item.class_id
      || item.student?.class_id
      || studentInfo?.class_id
      || studentInfo?.class_history?.[0]?.class_info?.id
      || ''
    )
    const className = item.class_name
      || item.student?.class_name
      || studentInfo?.class_name
      || studentInfo?.class_history?.[0]?.class_info?.name
      || ''

    return {
      id: item.id,
      studentId,
      classId,
      studentName: item.student_name || item.student?.full_name || '-',
      typeName: item.type_name || item.type?.name || 'Menunggu penentuan kategori',
      className,
      status: String(item.status || 'pending').toLowerCase(),
      statusLabel: item.status || 'pending',
      date: item.date,
      location: item.location || '',
      point: Number(item.points || item.point || item.type?.point || 0),
      description: item.description || ''
    }
  })
})

const filteredRecords = computed(() => {
  return normalizedRecords.value.filter(item => {
    const matchClass = !selectedClass.value || String(item.classId) === String(selectedClass.value)
    const matchStudent = !selectedStudent.value || String(item.studentId) === String(selectedStudent.value)
    const matchDate = !selectedDate.value || normalizeDateValue(item.date) === selectedDate.value
    return matchClass && matchStudent && matchDate
  })
})

const selectedStudentName = computed(() => {
  if (!selectedStudent.value) return ''
  return studentLookup.value[selectedStudent.value]?.full_name || ''
})

const activeFilterLabel = computed(() => {
  if (!selectedClass.value && !selectedStudent.value && selectedDate.value === getTodayValue()) {
    return 'Hari ini'
  }
  const className = classOptions.value.find(item => String(item.id) === String(selectedClass.value))?.name || 'Semua kelas'
  const dateLabel = selectedDate.value ? formatDateLong(selectedDate.value) : 'Semua tanggal'
  return `${className} - ${dateLabel}`
})

const emptyDescription = computed(() => {
  if (!selectedClass.value && !selectedStudent.value && selectedDate.value === getTodayValue()) {
    return 'Belum ada catatan perilaku positif untuk hari ini.'
  }
  return 'Tidak ada catatan yang sesuai dengan filter kelas, siswa, dan tanggal.'
})

watch(filteredStudentOptions, (items) => {
  if (!selectedStudent.value) return
  const stillExists = items.some(item => String(item.id) === String(selectedStudent.value))
  if (!stillExists) selectedStudent.value = ''
})

function getTodayValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function normalizeDateValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatDateLong(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function handleClassChange() {
  selectedStudent.value = ''
}

function resetFilters() {
  selectedClass.value = ''
  selectedStudent.value = ''
  selectedDate.value = getTodayValue()
}

function openDetail(id) {
  router.push(`/app/positive-behaviour/${id}`)
}

function normalizeStudents(payload) {
  return (payload || []).map(item => ({
    ...item,
    class_id: item.class_id || item.class_history?.[0]?.class_info?.id || '',
    class_name: item.class_name || item.class_history?.[0]?.class_info?.name || ''
  }))
}

async function fetchFilters() {
  const [classesRes, studentsRes] = await Promise.allSettled([
    classesApi.getList({ limit: 100 }),
    studentsApi.getList({ limit: 200 })
  ])

  if (classesRes.status === 'fulfilled') {
    classOptions.value = classesRes.value.data?.data?.classes || classesRes.value.data?.data || []
  } else {
    console.error('Failed to fetch classes:', classesRes.reason)
    classOptions.value = []
  }

  if (studentsRes.status === 'fulfilled') {
    studentOptions.value = normalizeStudents(studentsRes.value.data?.data?.students || studentsRes.value.data?.data || [])
  } else {
    console.error('Failed to fetch students:', studentsRes.reason)
    studentOptions.value = []
  }
}

async function fetchRecords() {
  try {
    const { data } = await mobileReportsApi.getMyPositivePoints(1, 100)
    records.value = data.data || []
  } catch (error) {
    console.error('Failed to fetch positive records:', error)
    records.value = []
  }
}

async function loadPage() {
  loading.value = true
  await Promise.allSettled([fetchFilters(), fetchRecords()])
  loading.value = false
}

async function handleRefresh(event) {
  await loadPage()
  event.target.complete()
}

onIonViewWillEnter(loadPage)
</script>

<style scoped>
.positive-page {
  --background: var(--color-background);
}

.safe-top-pad {
  height: calc(var(--safe-area-top) + 12px);
}

.sticky-controls {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 8px 16px 12px;
  background: linear-gradient(to bottom, var(--color-background) 85%, transparent);
}

.premium-controls-card {
  background: var(--color-surface);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.filter-toggle {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.filter-toggle__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.filter-toggle__text {
  min-width: 0;
  text-align: left;
}

.filter-toggle__icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  font-size: 18px;
  flex-shrink: 0;
}

.filter-toggle__arrow {
  color: var(--color-text-secondary);
  font-size: 18px;
  flex-shrink: 0;
}

.controls-heading__label {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.controls-heading__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls-heading__caption {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.filter-panel {
  padding: 0 0 4px;
}

.controls-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 16px;
  opacity: 0.6;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
}

.filter-row--date {
  justify-content: space-between;
}

.filter-label {
  min-width: 52px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.premium-select {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
  --padding-start: 0;
  --padding-top: 8px;
  --padding-bottom: 8px;
  max-width: 100%;
}

.premium-select::part(icon) {
  color: var(--color-primary);
  opacity: 0.8;
}

.premium-date-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  font-weight: 700;
  color: var(--color-primary);
  outline: none;
  text-align: right;
}

.reset-button {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-success);
}

.active-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: var(--color-success);
  font-size: 12px;
  font-weight: 700;
}

.active-filter-chip--soft {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.positive-card {
  background: var(--color-surface);
  border-radius: 18px;
  border: 1px solid var(--color-border);
  padding: 16px;
  box-shadow: var(--shadow-xs);
  border-left: 4px solid var(--color-success);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.positive-card:active {
  transform: scale(0.985);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.positive-card__top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.positive-card__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-success);
  flex-shrink: 0;
}

.positive-card__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.positive-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.positive-card__student {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.positive-card__type {
  font-size: 13px;
  color: var(--color-text-primary);
}

.positive-card__class {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.positive-card__description {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.positive-card__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-divider);
}

.positive-card__meta,
.positive-card__points {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.positive-card__meta {
  color: var(--color-text-secondary);
}

.positive-card__points {
  color: var(--color-success);
  font-weight: 700;
}

.positive-card__meta ion-icon,
.positive-card__points ion-icon {
  font-size: 14px;
}
</style>
