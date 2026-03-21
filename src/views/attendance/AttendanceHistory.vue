<template>
  <ion-page>
    <AppPageHeader title="Riwayat Presensi" :showBack="true" />

    <ion-content :fullscreen="true" class="bg-gray-50">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <!-- Filter Section -->
      <div class="filter-section sticky-header">
        <div class="filter-card">
          <div class="filter-card__label">
            <ion-icon name="calendar-outline"></ion-icon>
            <span>Pilih Bulan</span>
          </div>
          <input 
            type="month" 
            v-model="filters.month" 
            @change="fetchHistory(true)"
            class="filter-card__input"
          />
        </div>
      </div>

      <div class="px-4 pb-6">
        <!-- Skeleton Loading -->
        <div v-if="loading && items.length === 0" class="history-list mt-2">
          <AppSkeletonCard v-for="i in 5" :key="'skeleton-'+i" />
        </div>
        
        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="empty-state">
          <div class="empty-state__icon">
            <ion-icon name="document-text-outline"></ion-icon>
          </div>
          <h3 class="empty-state__title">Belum Ada Presensi</h3>
          <p class="empty-state__desc">Tidak ada data kehadiran untuk bulan yang Anda pilih.</p>
        </div>

        <!-- History List -->
        <div v-else class="history-list mt-2">
          <AttendanceHistoryCard 
            v-for="item in items" 
            :key="item.id"
            :date="item.attendance_date"
            :inTime="item.clock_in_at"
            :outTime="item.clock_out_at"
            :status="item.attendance_status"
            :durationMinutes="item.work_duration_minutes"
            @click="goToDetail(item.id)"
          />

          <!-- Load More Button -->
          <button v-if="page < totalPages" class="btn-load-more" @click="fetchHistory()" :disabled="loading">
            <ion-spinner v-if="loading" name="crescent" class="spinner-sm"></ion-spinner>
            <span v-else>Muat Lebih Banyak</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonRefresher, IonRefresherContent, IonSpinner, IonIcon } from '@ionic/vue'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AttendanceHistoryCard from '@/components/attendance/AttendanceHistoryCard.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import attendanceService from '@/services/api/attendance.service'

const router = useRouter()

const loading = ref(false)
const items = ref([])
const page = ref(1)
const totalPages = ref(1)

const today = new Date()
const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

const filters = ref({
  month: currentMonthStr
})

const fetchHistory = async (reset = false) => {
  if (reset) {
    page.value = 1
    items.value = []
  }
  
  loading.value = true
  try {
    const res = await attendanceService.getHistory({
      page: page.value,
      limit: 15,
      month: filters.value.month
    })
    
    if (res.data) {
      items.value = reset ? res.data.attendances : [...items.value, ...res.data.attendances]
      totalPages.value = res.data.totalPages
      page.value++
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHistory(true)
})

const handleRefresh = async (event) => {
  await fetchHistory(true)
  event.target.complete()
}

const goToDetail = (id) => {
  router.push(`/app/attendance/history/${id}`)
}
</script>

<style scoped>
.bg-gray-50 {
  --background: var(--color-background);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(248, 249, 250, 0.9); /* var(--color-background) with opacity */
  backdrop-filter: blur(10px);
  padding: var(--space-md) var(--space-md) var(--space-sm);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-md);
}

/* Filter Card */
.filter-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: border-color 0.2s;
}

.filter-card:focus-within {
  border-color: var(--color-primary);
}

.filter-card__label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.filter-card__label ion-icon {
  font-size: 18px;
  color: var(--color-primary);
}

.filter-card__input {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  outline: none;
  text-align: right;
  min-width: 130px;
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--space-xl);
  text-align: center;
  margin-top: var(--space-xl);
}

.empty-state__icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-lg);
}

.empty-state__icon ion-icon {
  font-size: 40px;
  color: var(--color-primary);
}

.empty-state__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs);
}

.empty-state__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Load More Button */
.btn-load-more {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  margin-top: var(--space-sm);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
  border: none;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-load-more:active {
  transform: scale(0.98);
}

.btn-load-more:disabled {
  opacity: 0.7;
}

.spinner-sm {
  width: 20px;
  height: 20px;
}
</style>
