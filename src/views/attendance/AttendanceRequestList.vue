<template>
  <ion-page>
    <AppPageHeader title="Riwayat Pengajuan" :showBack="true" />

    <ion-content :fullscreen="true" class="bg-gray-50">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="px-4 py-3 sticky-header border-b border-gray-100">
        <!-- Floating Add Button -->
        <button 
          @click="router.push('/app/attendance/requests/new')"
          class="action-btn btn-primary"
        >
          <ion-icon name="add-circle" class="text-xl" />
          <span>Buat Pengajuan Baru</span>
        </button>

        <!-- Status Filter -->
        <div class="filter-chips">
          <button 
            v-for="st in statusFilters" 
            :key="st.value"
            @click="setFilter(st.value)"
            class="filter-chip"
            :class="{ 'active': filters.status === st.value }"
          >
            {{ st.label }}
          </button>
        </div>
      </div>

      <div class="p-4 safe-bottom">
        <div v-if="loading && items.length === 0" class="py-12 text-center text-gray-400">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p class="mt-3 text-sm">Memuat pengajuan...</p>
        </div>
        
        <div v-else-if="items.length === 0" class="py-12 text-center text-gray-400 flex flex-col items-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
             <ion-icon name="document-text-outline" class="text-3xl text-gray-300"></ion-icon>
          </div>
          <p class="text-sm font-medium">Belum ada pengajuan dengan status ini.</p>
        </div>

        <div v-else class="request-list">
          <AttendanceRequestCard 
            v-for="item in items" 
            :key="item.id"
            :type="item.request_type"
            :date="item.attendance_date"
            :reason="item.reason"
            :status="item.request_status"
            @click="goToDetail(item.id)"
          />

          <button v-if="page < totalPages" class="load-more-btn" @click="fetchRequests()">
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
import AttendanceRequestCard from '@/components/attendance/AttendanceRequestCard.vue'
import attendanceService from '@/services/api/attendance.service'

const router = useRouter()

const loading = ref(false)
const items = ref([])
const page = ref(1)
const totalPages = ref(1)

const filters = ref({
  status: '' // empty means all
})

const statusFilters = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Disetujui', value: 'APPROVED' },
  { label: 'Ditolak', value: 'REJECTED' }
]

const setFilter = (val) => {
  filters.value.status = val
  fetchRequests(true)
}

const fetchRequests = async (reset = false) => {
  if (reset) {
    page.value = 1
    items.value = []
  }
  
  loading.value = true
  try {
    const res = await attendanceService.getMyRequests({
      page: page.value,
      limit: 15,
      request_status: filters.value.status
    })
    
    if (res.data) {
      items.value = reset ? res.data.requests : [...items.value, ...res.data.requests]
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
  fetchRequests(true)
})

const handleRefresh = async (event) => {
  await fetchRequests(true)
  event.target.complete()
}

const goToDetail = (id) => {
  router.push(`/app/attendance/requests/${id}`)
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
.request-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  border: none;
  margin-bottom: var(--space-md);
  transition: transform 0.2s;
}
.action-btn:active {
  transform: scale(0.97);
}
.btn-primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
}
.filter-chips {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  padding-bottom: var(--space-xs);
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar {
  display: none;
}
.filter-chip {
  white-space: nowrap;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}
.filter-chip.active {
  background: var(--color-primary);
  color: white;
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
.safe-bottom {
  padding-bottom: calc(20px + var(--ion-safe-area-bottom, 0));
}
</style>
