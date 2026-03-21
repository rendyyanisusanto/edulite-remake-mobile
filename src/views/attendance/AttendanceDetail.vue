<template>
  <ion-page>
    <AppPageHeader title="Detail Presensi" :showBack="true" />

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
        
        <!-- Header status -->
        <div class="bg-white rounded-2xl p-5 mb-4 border border-gray-200 shadow-sm text-center">
          <p class="text-sm font-bold text-gray-500 mb-2 uppercase">{{ formattedDate }}</p>
          <AppStatusBadge :status="mappedStatus" :label="mappedLabel" class="scale-110 mb-4" />
          <div class="text-xs text-gray-400 font-medium">Shift: {{ item.shift ? item.shift.name : '-' }}</div>
        </div>

        <!-- Clock In Info -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
          <div class="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center justify-between">
            <div class="flex items-center gap-2 text-primary font-bold">
              <ion-icon name="log-in" class="text-lg" />
              <span>Clock In</span>
            </div>
            <span class="text-lg font-extrabold text-primary">{{ formatTime(item.clock_in_at) }}</span>
          </div>
          <div class="p-4 text-sm">
             <div class="flex justify-between mb-2">
               <span class="text-gray-500">Metode</span>
               <span class="font-semibold text-gray-800">{{ item.clock_in_method || '-' }}</span>
             </div>
             <div class="flex justify-between mb-2">
               <span class="text-gray-500">Status Validasi</span>
               <span class="font-semibold text-gray-800">{{ item.clock_in_status || '-' }}</span>
             </div>
             <div class="flex justify-between mb-2">
               <span class="text-gray-500">Jarak Lokasi</span>
               <span class="font-semibold text-gray-800">{{ item.clock_in_distance_meters ? Math.round(item.clock_in_distance_meters) + ' m' : '-' }}</span>
             </div>
             <div v-if="item.clock_in_note" class="mt-3 pt-3 border-t border-gray-100">
               <span class="text-gray-500 block mb-1">Catatan:</span>
               <p class="text-gray-800 italic">"{{ item.clock_in_note }}"</p>
             </div>
          </div>
        </div>

        <!-- Clock Out Info -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
          <div class="bg-danger/5 px-4 py-3 border-b border-danger/10 flex items-center justify-between">
            <div class="flex items-center gap-2 text-danger font-bold">
              <ion-icon name="log-out" class="text-lg" />
              <span>Clock Out</span>
            </div>
            <span class="text-lg font-extrabold text-danger">{{ formatTime(item.clock_out_at) }}</span>
          </div>
          <div class="p-4 text-sm" :class="{ 'opacity-50': !item.clock_out_at }">
             <div class="flex justify-between mb-2">
               <span class="text-gray-500">Metode</span>
               <span class="font-semibold text-gray-800">{{ item.clock_out_method || '-' }}</span>
             </div>
             <div class="flex justify-between mb-2">
               <span class="text-gray-500">Status Validasi</span>
               <span class="font-semibold text-gray-800">{{ item.clock_out_status || '-' }}</span>
             </div>
             <div class="flex justify-between mb-2">
               <span class="text-gray-500">Jarak Lokasi</span>
               <span class="font-semibold text-gray-800">{{ item.clock_out_distance_meters ? Math.round(item.clock_out_distance_meters) + ' m' : '-' }}</span>
             </div>
             <div class="flex justify-between mb-2">
               <span class="text-gray-500">Durasi Kerja</span>
               <span class="font-semibold text-gray-800">{{ durationText }}</span>
             </div>
             <div v-if="item.clock_out_note" class="mt-3 pt-3 border-t border-gray-100">
               <span class="text-gray-500 block mb-1">Catatan:</span>
               <p class="text-gray-800 italic">"{{ item.clock_out_note }}"</p>
             </div>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonSpinner, IonIcon } from '@ionic/vue'
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
    const res = await attendanceService.getAttendanceDetail(id)
    item.value = res.data
  } catch (err) {
    error.value = 'Gagal memuat detail presensi'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)

const formattedDate = computed(() => {
  if (!item.value?.attendance_date) return '-'
  return new Date(item.value.attendance_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const formatTime = (isoString) => {
  if (!isoString) return '--:--'
  return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const durationText = computed(() => {
  const d = item.value?.work_duration_minutes
  if (!d) return '-'
  const h = Math.floor(d / 60)
  const m = d % 60
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
})

const mappedStatus = computed(() => {
  switch (item.value?.attendance_status) {
    case 'PRESENT': return 'approved'
    case 'LATE': return 'pending'
    case 'INCOMPLETE': return 'pending'
    case 'ABSENT': return 'rejected'
    case 'EXCUSED': return 'info'
    default: return 'neutral'
  }
})

const mappedLabel = computed(() => {
  switch (item.value?.attendance_status) {
    case 'PRESENT': return 'Hadir'
    case 'LATE': return 'Terlambat'
    case 'INCOMPLETE': return 'Tidak Lengkap'
    case 'ABSENT': return 'Alpha'
    case 'EXCUSED': return 'Izin/Sakit'
    default: return item.value?.attendance_status || 'Belum Absen'
  }
})
</script>

<style scoped>
.bg-gray-50 {
  --background: var(--color-background);
}
.safe-bottom {
  padding-bottom: calc(20px + var(--ion-safe-area-bottom, 0));
}
</style>
