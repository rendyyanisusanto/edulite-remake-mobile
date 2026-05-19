<template>
  <ion-page class="permission-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/home" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Surat Izin</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div class="header-section">
        <p class="header-subtitle">Daftar Izin & Kegiatan Siswa</p>
      </div>

      <div class="sticky-controls">
        <div class="premium-controls-card">
          <div class="search-input-wrapper">
            <ion-icon name="search-outline" class="search-icon" />
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Cari kegiatan atau lokasi..."
              @input="onSearch(searchQuery)"
              class="premium-input"
            />
          </div>
          
          <div class="controls-divider"></div>
          
          <div class="filter-row">
            <ion-icon name="funnel" class="filter-icon" />
            <span class="filter-label">Status:</span>
            <ion-select
              v-model="selectedStatus"
              interface="action-sheet"
              placeholder="Semua"
              @ionChange="onStatusChange"
              class="premium-select"
              cancel-text="Batal"
            >
              <ion-select-option value="">Semua Status</ion-select-option>
              <ion-select-option value="DRAFT">Draft</ion-select-option>
              <ion-select-option value="PENDING">Menunggu</ion-select-option>
              <ion-select-option value="APPROVED">Disetujui</ion-select-option>
              <ion-select-option value="REJECTED">Ditolak</ion-select-option>
              <ion-select-option value="CANCELLED">Dibatalkan</ion-select-option>
            </ion-select>
          </div>
        </div>
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading && letters.length === 0" class="list-container">
        <AppSkeletonCard v-for="i in 4" :key="i" />
      </div>

      <!-- Empty state -->
      <AppEmptyState
        v-else-if="!loading && letters.length === 0"
        icon="document-text-outline"
        title="Belum ada surat izin"
        description="Belum ada catatan surat izin yang ditemukan."
      />

      <!-- List -->
      <div v-else class="list-container">
        <AppListCard
          v-for="letter in letters"
          :key="letter.id"
          class="staggered-item"
          :title="letter.activity_name"
          :subtitle="`${formatDate(letter.start_date)} • ${letter.location}`"
          :meta="`${letter.students ? letter.students.length : 0} Siswa`"
          :icon="getStatusIcon(letter.status)"
          :iconBg="getStatusBg(letter.status)"
          :iconColor="getStatusColor(letter.status)"
          :accent="getStatusAccent(letter.status)"
          @click="router.push('/app/permission-letters/' + letter.id)"
        >
          <template #badge>
            <span class="status-badge" :class="letter.status.toLowerCase()">
              {{ translateStatus(letter.status) }}
            </span>
          </template>
        </AppListCard>
      </div>

      <!-- Infinite Scroll -->
      <ion-infinite-scroll @ionInfinite="loadMore($event)" :disabled="isLastPage">
        <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Memuat data..." />
      </ion-infinite-scroll>

      <div style="height: 80px;" />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="fab-create">
      <ion-fab-button @click="router.push('/app/permission-letters/new')">
        <ion-icon name="add-outline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue'
import { permissionLettersApi } from '@/api/permission-letters.api'
import { useAuthStore } from '@/store/auth.store'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppListCard from '@/components/common/AppListCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const letters = ref([])
const searchQuery = ref('')
const selectedStatus = ref('')
const page = ref(1)
const isLastPage = ref(false)

function onSearch(query) {
  searchQuery.value = query
  fetchLetters(true)
}

function onStatusChange() {
  fetchLetters(true)
}

async function fetchLetters(reset = false) {
  if (reset) {
    page.value = 1
    letters.value = []
    isLastPage.value = false
  }

  try {
    const { data } = await permissionLettersApi.getList({ 
      limit: 20,
      page: page.value,
      search: searchQuery.value,
      status: selectedStatus.value || undefined,
      // For teachers, we usually auto-filter by their teacher_id in backend if auth strictly enforces it. 
      // If we need to send it explicitly:
      // teacher_id: ...(if needed, but backend often handles teacher data via token)
    })
    
    // Fallback parsing for common API variations
    const newLetters = data.data?.permissionLetters || data.data || []
    if (newLetters.length < 20) {
      isLastPage.value = true
    }
    
    const existingIds = new Set(letters.value.map(s => s.id))
    const fresh = newLetters.filter(s => !existingIds.has(s.id))
    
    letters.value = [...letters.value, ...fresh]
  } catch (err) {
    console.error('Failed to fetch letters:', err)
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
  await fetchLetters()
  event.target.complete()
}

async function handleRefresh(event) {
  await fetchLetters(true)
  event.target.complete()
}

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function translateStatus(status) {
  const map = {
    'DRAFT': 'Draft',
    'PENDING': 'Menunggu',
    'APPROVED': 'Disetujui',
    'REJECTED': 'Ditolak',
    'CANCELLED': 'Batal',
    'FINISHED': 'Selesai'
  }
  return map[status] || status
}

function getStatusIcon(status) {
  switch (status) {
    case 'APPROVED': return 'checkmark-circle'
    case 'FINISHED': return 'checkmark-circle'
    case 'PENDING': return 'time-outline'
    case 'REJECTED': return 'alert-circle-outline'
    case 'CANCELLED': return 'close-circle-outline'
    case 'DRAFT': return 'document-outline'
    default: return 'document-text-outline'
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'APPROVED': return '#10B981' // Green
    case 'FINISHED': return '#10B981' // Green
    case 'PENDING': return '#F59E0B' // Amber
    case 'REJECTED': return '#EF4444' // Red
    case 'CANCELLED': return '#64748B' // Slate
    case 'DRAFT': return '#94A3B8' // Light Slate
    default: return '#3B82F6' // Blue
  }
}

function getStatusBg(status) {
  switch (status) {
    case 'APPROVED': return 'rgba(16, 185, 129, 0.1)'
    case 'FINISHED': return 'rgba(16, 185, 129, 0.1)'
    case 'PENDING': return 'rgba(245, 158, 11, 0.1)'
    case 'REJECTED': return 'rgba(239, 68, 68, 0.1)'
    case 'CANCELLED': return 'rgba(100, 116, 139, 0.1)'
    case 'DRAFT': return 'rgba(148, 163, 184, 0.1)'
    default: return 'rgba(59, 130, 246, 0.1)'
  }
}

function getStatusAccent(status) {
  return getStatusColor(status)
}

onMounted(() => {
  fetchLetters(true)
})
</script>

<style scoped>
.permission-page {
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

/* Premium Sticky Controls (Synced with StudentsPage) */
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

.staggered-item {
  animation: slideFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0,0,0,0.05);
  color: var(--color-text-secondary);
}
.status-badge.draft { background: #f1f5f9; color: #64748b; }
.status-badge.pending { background: #fef3c7; color: #b45309; }
.status-badge.approved { background: #d1fae5; color: #047857; }
.status-badge.rejected { background: #fee2e2; color: #b91c1c; }
.status-badge.cancelled { background: #f1f5f9; color: #475569; }

.fab-create {
  --ion-safe-area-bottom: 90px;
}
.fab-create ion-fab-button {
  --background: var(--color-primary);
  --box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}
</style>
