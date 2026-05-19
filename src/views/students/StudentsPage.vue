<template>
  <ion-page class="students-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/home" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Data Siswa</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="header-section">
        <p class="header-subtitle">Daftar Siswa Terdaftar</p>
      </div>

      <div class="sticky-controls">
        <div class="premium-controls-card">
          <!-- Custom Search Input to match the premium unified card look -->
          <div class="search-input-wrapper">
            <ion-icon name="search-outline" class="search-icon" />
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Cari nama atau NIS..."
              @input="onSearch(searchQuery)"
              class="premium-input"
            />
          </div>
          
          <div class="controls-divider"></div>
          
          <div class="filter-row">
            <ion-icon name="funnel" class="filter-icon" />
            <span class="filter-label">Kelas:</span>
            <ion-select
              v-model="selectedClass"
              interface="action-sheet"
              placeholder="Semua Kelas"
              @ionChange="onClassChange"
              class="premium-select"
              cancel-text="Batal"
            >
              <ion-select-option value="">Semua Kelas</ion-select-option>
              <ion-select-option v-for="c in classes" :key="c.id" :value="c.id">
                {{ c.name }}
              </ion-select-option>
            </ion-select>
          </div>
        </div>
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading && students.length === 0" class="list-container">
        <AppSkeletonCard v-for="i in 5" :key="i" />
      </div>

      <!-- Empty state -->
      <AppEmptyState
        v-else-if="!loading && students.length === 0"
        icon="search-outline"
        title="Siswa tidak ditemukan"
        description="Cobalah mencari dengan nama atau kelas yang berbeda."
      />

      <!-- Student list -->
      <div v-else class="list-container">
        <AppListCard
          v-for="(student, index) in students"
          :key="student.id"
          class="staggered-item"
          :title="student.full_name"
          :subtitle="`NIS: ${student.nis || '-'} • ${student.class_history?.[0]?.class_info?.name || 'Belum ada kelas'}`"
          :meta="student.gender === 'MALE' ? '♂ Laki-laki' : (student.gender === 'FEMALE' ? '♀ Perempuan' : '−')"
          :avatar="student.full_name"
          :accent="student.gender === 'MALE' ? '#3B82F6' : (student.gender === 'FEMALE' ? '#EC4899' : '#10B981')"
          @click="router.push('/app/students/' + student.id)"
        />
      </div>

      <!-- Infinite Scroll -->
      <ion-infinite-scroll @ionInfinite="loadMore($event)" :disabled="isLastPage">
        <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Memuat data lebih banyak..." />
      </ion-infinite-scroll>

      <div style="height: 80px;" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, IonInfiniteScroll, IonInfiniteScrollContent, IonIcon } from '@ionic/vue'
import { studentsApi } from '@/api/students.api'
import { classesApi } from '@/api/classes.api'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppListCard from '@/components/common/AppListCard.vue'

const router = useRouter()
const loading = ref(true)
const students = ref([])
const classes = ref([])
const searchQuery = ref('')
const selectedClass = ref('')
const page = ref(1)
const isLastPage = ref(false)

function onSearch(query) {
  searchQuery.value = query
  fetchStudents(true)
}

function onClassChange() {
  fetchStudents(true)
}

async function fetchClasses() {
  try {
    const { data } = await classesApi.getList({ limit: 100 })
    classes.value = data.data?.classes || data.data || []
  } catch (err) {
    console.error('Failed to fetch classes:', err)
  }
}

async function fetchStudents(reset = false) {
  if (reset) {
    page.value = 1
    students.value = []
    isLastPage.value = false
    // loading.value = true
  }

  try {
    const { data } = await studentsApi.getList({ 
      limit: 20,
      page: page.value,
      search: searchQuery.value,
      class_id: selectedClass.value || undefined
    })
    
    const newStudents = data.data?.students || []
    if (newStudents.length < 20) {
      isLastPage.value = true
    }
    
    // Prevent duplicates
    const existingIds = new Set(students.value.map(s => s.id))
    const fresh = newStudents.filter(s => !existingIds.has(s.id))
    
    students.value = [...students.value, ...fresh]
  } catch (err) {
    console.error('Failed to fetch students:', err)
    if (students.value.length === 0) {
      students.value = DEMO_STUDENTS
    }
  } finally {
    loading.value = false
  }
}

async function loadMore(event) {
  if (isLastPage.value) {
    event.target.complete()
    return
  }
  page.value++
  await fetchStudents()
  event.target.complete()
}

async function handleRefresh(event) {
  await fetchClasses()
  await fetchStudents(true)
  event.target.complete()
}

// Demo fallback data
const DEMO_STUDENTS = [
  { id: 1, full_name: 'Ahmad Fauzi', nis: '2024001', gender: 'MALE', class_history: [{ class_info: { name: 'XII IPA 1' } }] },
  { id: 2, full_name: 'Siti Rahayu', nis: '2024002', gender: 'FEMALE', class_history: [{ class_info: { name: 'XI IPS 2' } }] },
  { id: 3, full_name: 'Budi Santoso', nis: '2024003', gender: 'MALE', class_history: [{ class_info: { name: 'X TKJ 1' } }] }
]

onMounted(() => {
  fetchClasses()
  fetchStudents(true)
})
</script>

<style scoped>
.students-page {
  --background: var(--color-background);
}

.modern-toolbar {
  --background: linear-gradient(135deg, var(--color-primary, #3B82F6) 0%, #1E40AF 100%);
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
  transition: all 0.2s ease;
}

.back-btn-wrapper:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
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

.header-section {
  padding: 16px 16px 0;
  margin-bottom: 4px;
}

.header-subtitle {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 0;
}

.sticky-controls {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 8px 16px 16px;
  background: linear-gradient(to bottom, var(--color-background) 85%, transparent);
}

.premium-controls-card {
  background: var(--color-surface);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s;
}

/* Custom Search inside Card */
.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: transparent;
}

.search-icon {
  font-size: 20px;
  color: var(--color-text-tertiary);
  margin-right: 12px;
}

.premium-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  font-family: inherit;
  font-weight: 500;
  color: var(--color-text-primary);
  outline: none;
}
.premium-input::placeholder {
  color: var(--color-text-tertiary);
  font-weight: 400;
}

.controls-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 16px;
  opacity: 0.6;
}

/* Filter Row inside Card */
.filter-row {
  display: flex;
  align-items: center;
  padding: 6px 16px;
}

.filter-icon {
  font-size: 16px;
  color: var(--color-primary);
  margin-right: 8px;
  background: var(--color-primary-subtle);
  padding: 4px;
  border-radius: 6px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-right: 8px;
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

.list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

/* Staggering Animation for lists */
.staggered-item {
  animation: slideFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
