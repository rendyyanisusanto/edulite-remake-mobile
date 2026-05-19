<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/attendance/requests" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Detail Pengajuan</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="bg-gray-50">
      <div v-if="loading" class="flex flex-col items-center justify-center p-12 text-gray-400">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <span class="mt-4 text-sm font-medium">Memuat detail...</span>
      </div>

      <div v-else-if="error" class="p-6 text-center">
        <p class="text-danger font-medium">{{ error }}</p>
        <button class="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold" @click="fetchDetail">Coba Lagi</button>
      </div>

      <div v-else-if="item" class="p-4 safe-bottom">
        
        <!-- Header -->
        <div class="bg-white rounded-2xl p-5 mb-4 border border-gray-200 shadow-sm">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ formattedDate }}</p>
              <h2 class="text-lg font-extrabold text-gray-800 mt-1">{{ typeLabel }}</h2>
            </div>
            <AppStatusBadge :status="mappedStatusBadgeInfo.status" :label="mappedStatusBadgeInfo.label" />
          </div>
          
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 italic text-gray-700 text-sm">
            "{{ item.reason }}"
          </div>
        </div>

        <!-- Time Requests -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 p-5" v-if="item.requested_clock_in_at || item.requested_clock_out_at">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Waktu yang Diajukan</h3>
          
          <div v-if="item.requested_clock_in_at" class="mb-4">
            <div class="flex items-center gap-2 text-primary font-bold mb-1">
              <ion-icon name="log-in" />
              <span class="text-sm">Clock In</span>
            </div>
            <p class="text-gray-800 font-semibold text-lg ml-6">{{ formatTime(item.requested_clock_in_at) }}</p>
            <p v-if="item.requested_clock_in_note" class="text-xs text-gray-500 ml-6 italic mt-1">{{ item.requested_clock_in_note }}</p>
          </div>

          <div v-if="item.requested_clock_out_at">
            <div class="flex items-center gap-2 text-danger font-bold mb-1">
              <ion-icon name="log-out" />
              <span class="text-sm">Clock Out</span>
            </div>
            <p class="text-gray-800 font-semibold text-lg ml-6">{{ formatTime(item.requested_clock_out_at) }}</p>
            <p v-if="item.requested_clock_out_note" class="text-xs text-gray-500 ml-6 italic mt-1">{{ item.requested_clock_out_note }}</p>
          </div>
        </div>

        <!-- Reviewer Result -->
        <div v-if="item.request_status !== 'PENDING'" class="bg-white rounded-2xl shadow-sm p-5 border-y border-r border-gray-200 border-l-4" :class="item.request_status === 'APPROVED' ? 'border-l-success' : 'border-l-danger'">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hasil Review</h3>
          <p class="text-sm text-gray-800 font-medium">Oleh: {{ item.reviewer ? item.reviewer.name : 'Administrator' }}</p>
          <p v-if="item.review_note" class="text-sm text-gray-700 italic mt-2 bg-gray-50 p-3 rounded-lg">
            "{{ item.review_note }}"
          </p>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonSpinner, IonIcon } from '@ionic/vue'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'
import attendanceService from '@/services/api/attendance.service'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const item = ref(null)

const fetchDetail = async () => {
  loading.value = true
  error.value = null
  try {
    const id = route.params.id
    const res = await attendanceService.getRequestDetail(id)
    item.value = res.data
  } catch (err) {
    error.value = 'Gagal memuat detail pengajuan'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)

const mappedStatusBadgeInfo = computed(() => {
  switch (item.value?.request_status) {
    case 'PENDING': return { status: 'pending', label: 'Menunggu' }
    case 'APPROVED': return { status: 'approved', label: 'Disetujui' }
    case 'REJECTED': return { status: 'rejected', label: 'Ditolak' }
    case 'CANCELLED': return { status: 'neutral', label: 'Dibatalkan' }
    default: return { status: 'neutral', label: item.value?.request_status || 'Draft' }
  }
})

const TYPE_CONFIG = {
  FORGOT_CLOCK_IN: 'Lupa Clock In',
  FORGOT_CLOCK_OUT: 'Lupa Clock Out',
  MISSED_BOTH: 'Lupa Absen Keduanya',
  LOCATION_EXCEPTION: 'Pengecualian Lokasi',
  TIME_CORRECTION: 'Koreksi Waktu',
}

const formattedDate = computed(() => {
  if (!item.value?.attendance_date) return '-'
  return new Date(item.value.attendance_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

const typeLabel = computed(() => TYPE_CONFIG[item.value?.request_type] || item.value?.request_type)

const formatTime = (isoString) => {
  if (!isoString) return '--:--'
  return new Date(isoString).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
}
</script>

<style scoped>
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

.bg-gray-50 {
  --background: var(--color-background);
}
.safe-bottom {
  padding-bottom: calc(20px + var(--ion-safe-area-bottom, 0));
}
.text-danger { color: var(--color-danger); }
.text-success { color: var(--color-success); }
.text-primary { color: var(--color-primary); }
.text-warning { color: var(--color-warning); }
.border-danger { border-color: var(--color-danger); }
.border-success { border-color: var(--color-success); }
</style>
