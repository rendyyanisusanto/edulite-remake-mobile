<template>
  <ion-page>
    <AppPageHeader title="Riwayat Presensi" :showBack="true" />

    <ion-content :fullscreen="true" class="bg-gray-50">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="px-4 py-3 sticky-header">
        <label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Pilih Bulan</label>
        <input 
          type="month" 
          v-model="filters.month" 
          @change="fetchHistory(true)"
          class="history-filter-input"
        />
      </div>

      <div class="px-4 pb-6">
        <div v-if="loading && items.length === 0" class="py-10 text-center text-gray-400">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p class="mt-2 text-sm">Memuat riwayat...</p>
        </div>
        
        <div v-else-if="items.length === 0" class="py-10 text-center text-gray-400">
          <ion-icon name="document-text-outline" class="text-4xl text-gray-300"></ion-icon>
          <p class="mt-2 text-sm font-medium">Tidak ada data presensi bulan ini.</p>
        </div>

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

          <!-- Simple load more button -->
          <button v-if="page < totalPages" class="load-more-btn" @click="fetchHistory()">
            Muat Lebih Banyak
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
  background: var(--color-background);
  padding-bottom: var(--space-sm);
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.history-filter-input {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.2s;
}
.history-filter-input:focus {
  border-color: var(--color-primary);
}
.load-more-btn {
  width: 100%;
  padding: var(--space-md);
  margin-top: var(--space-md);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  background: var(--color-primary-subtle);
  border-radius: var(--radius-md);
  border: none;
}
</style>
