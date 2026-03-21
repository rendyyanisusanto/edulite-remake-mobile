<template>
  <ion-page>
    <AppPageHeader title="Riwayat Pengajuan" :showBack="true" />

    <ion-content :fullscreen="true" class="bg-gray-50">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="sticky-header">
        <!-- Floating Add Button -->
        <button 
          @click="router.push('/app/attendance/requests/new')"
          class="action-btn"
        >
          <ion-icon name="add-circle" class="action-btn__icon" />
          <span>Buat Pengajuan Baru</span>
        </button>

        <!-- Status Filter -->
        <div class="filter-chips">
          <button 
            v-for="st in statusFilters" 
            :key="st.value"
            @click="setFilter(st.value)"
            class="filter-chip"
            :class="{ 'filter-chip--active': filters.status === st.value }"
          >
            {{ st.label }}
          </button>
        </div>
      </div>

      <div class="px-4 pb-6 safe-bottom">
        <!-- Skeleton Loading -->
        <div v-if="loading && items.length === 0" class="request-list mt-2">
          <AppSkeletonCard v-for="i in 5" :key="'skeleton-'+i" />
        </div>
        
        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="empty-state">
          <div class="empty-state__icon">
            <ion-icon name="document-text-outline"></ion-icon>
          </div>
          <h3 class="empty-state__title">Belum Ada Pengajuan</h3>
          <p class="empty-state__desc">Anda belum memiliki riwayat pengajuan dengan status ini.</p>
        </div>

        <!-- Request List -->
        <div v-else class="request-list mt-2">
          <AttendanceRequestCard 
            v-for="item in items" 
            :key="item.id"
            :type="item.request_type"
            :date="item.attendance_date"
            :reason="item.reason"
            :status="item.request_status"
            @click="goToDetail(item.id)"
          />

          <!-- Load More Button -->
          <button v-if="page < totalPages" class="btn-load-more" @click="fetchRequests()" :disabled="loading">
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
import AttendanceRequestCard from '@/components/attendance/AttendanceRequestCard.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
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
  if(filters.value.status === val) return
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
  background: rgba(248, 249, 250, 0.95);
  backdrop-filter: blur(10px);
  padding: var(--space-md) var(--space-md) var(--space-sm);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-md);
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  border: none;
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-btn:active {
  transform: scale(0.97);
  box-shadow: 0 2px 6px rgba(var(--ion-color-primary-rgb), 0.2);
}

.action-btn__icon {
  font-size: 20px;
}

.filter-chips {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding-bottom: var(--space-xs);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.filter-chips::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}

.filter-chip--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 4px 6px rgba(var(--ion-color-primary-rgb), 0.15);
}

.request-list {
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

.safe-bottom {
  padding-bottom: calc(20px + var(--ion-safe-area-bottom, 0));
}
</style>
