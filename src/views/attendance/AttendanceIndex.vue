<template>
  <ion-page class="attendance-page">
    <AppPageHeader title="Presensi Online" />

    <ion-content :fullscreen="true" class="ion-padding bg-gray-50">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <!-- Date Info -->
      <div class="date-header">
        <h2 class="date-title">{{ formattedDate }}</h2>
        <p class="shift-subtitle">{{ shiftInfoText }}</p>
      </div>

      <!-- Main Status Card -->
      <AttendanceStatusCard 
        :status="store.todayStatus"
        :inTime="formattedInTime"
        :outTime="formattedOutTime"
        :durationMinutes="durationMinutes"
      />

      <!-- Location Validation Card -->
      <LocationStatusCard 
        :loading="loc.loading.value"
        :error="loc.error.value"
        :distanceMeters="currentDistance"
        :accuracyMeters="loc.accuracy.value"
        :maxRadius="maxRadius"
        @refresh="refreshLocation"
      />

      <!-- Clock Action -->
      <ClockActionCard 
        :actionType="currentActionType"
        :loading="actionLoading"
        :disabled="isActionDisabled"
        @clock-action="handleClockAction"
      />

      <!-- Quick Menu -->
      <div class="quick-menu-section">
        <h3 class="section-title">Akses Cepat</h3>
        <div class="quick-menu-grid">
          <button class="qm-btn" @click="router.push('/app/attendance/history')">
            <div class="qm-icon"><ion-icon name="time" /></div>
            <span class="qm-label">Riwayat</span>
          </button>
          <button class="qm-btn" @click="router.push('/app/attendance/requests')">
            <div class="qm-icon"><ion-icon name="document-text" /></div>
            <span class="qm-label">Pengajuan</span>
          </button>
          <button class="qm-btn" @click="router.push('/app/attendance/requests/new')">
            <div class="qm-icon"><ion-icon name="add-circle" /></div>
            <span class="qm-label">Buat Request</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonRefresher, IonRefresherContent, IonIcon, actionSheetController } from '@ionic/vue'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AttendanceStatusCard from '@/components/attendance/AttendanceStatusCard.vue'
import LocationStatusCard from '@/components/attendance/LocationStatusCard.vue'
import ClockActionCard from '@/components/attendance/ClockActionCard.vue'

import { useAttendanceStore } from '@/store/attendance.store'
import { useCurrentLocation } from '@/composables/useCurrentLocation'
// useToast import removed
import { toastController, alertController } from '@ionic/vue'

const router = useRouter()
const store = useAttendanceStore()
const loc = useCurrentLocation()

const actionLoading = ref(false)

onMounted(async () => {
  await Promise.all([
    store.fetchTodayInfo(),
    loc.fetchLocation()
  ])
})

const handleRefresh = async (event) => {
  await Promise.all([
    store.fetchTodayInfo(),
    loc.fetchLocation()
  ])
  event.target.complete()
}

const refreshLocation = async () => {
  await loc.fetchLocation()
}

// Formatters
const formattedDate = computed(() => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

const shiftInfoText = computed(() => {
  if (!store.activeShift) return 'Belum ada shift aktif'
  const start = store.activeShift.clock_in_start ? store.activeShift.clock_in_start.slice(0, 5) : '-'
  const end = store.activeShift.clock_out_end ? store.activeShift.clock_out_end.slice(0, 5) : '-'
  return `Shift: ${store.activeShift.name} (${start} - ${end})`
})

const formatTime = (isoString) => isoString ? new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
const formattedInTime = computed(() => formatTime(store.clockInTime))
const formattedOutTime = computed(() => formatTime(store.clockOutTime))
const durationMinutes = computed(() => store.todayInfo?.attendance?.work_duration_minutes || 0)

// Location logic
const maxRadius = computed(() => store.activeSetting?.radius_meters || 100)
const allowOutsideLocation = computed(() => store.activeSetting?.allow_outside_radius || false)

const currentDistance = computed(() => {
  if (!store.activeSetting?.center_lat || !store.activeSetting?.center_lng || !loc.latitude.value) return null
  return loc.calculateDistance(
    parseFloat(store.activeSetting.center_lat),
    parseFloat(store.activeSetting.center_lng),
    loc.latitude.value,
    loc.longitude.value
  )
})

const isInsideRadius = computed(() => {
  if (currentDistance.value === null) return false
  return currentDistance.value <= maxRadius.value
})

const isActionDisabled = computed(() => {
  if (store.hasClockedOut) return true
  if (loc.loading.value || loc.error.value) return true
  if (!isInsideRadius.value && !allowOutsideLocation.value) return true
  return false
})

const currentActionType = computed(() => {
  if (store.hasClockedOut) return 'done'
  if (store.hasClockedIn) return 'out'
  return 'in'
})

// Clock Action Handler
const showToast = async (msg, color='success') => {
  const t = await toastController.create({
    message: msg,
    duration: 3000,
    color: color,
    position: 'top'
  })
  return t.present()
}

const handleClockAction = async () => {
  if (isActionDisabled.value) return

  const actionName = currentActionType.value === 'in' ? 'Clock In' : 'Clock Out'
  
  const alert = await alertController.create({
    header: `Konfirmasi ${actionName}`,
    message: `Apakah Anda yakin ingin melakukan ${actionName} sekarang?`,
    buttons: [
      { text: 'Batal', role: 'cancel' },
      { 
        text: 'Ya, Lanjutkan', 
        handler: async () => {
          actionLoading.value = true
          try {
            const locStatus = isInsideRadius.value ? 'ON_SITE' : 'OUTSIDE_RADIUS'
            const payload = {
              latitude: loc.latitude.value,
              longitude: loc.longitude.value,
              accuracy: loc.accuracy.value,
              distance_meters: currentDistance.value,
              status: locStatus,
              note: ''
            }

            if (currentActionType.value === 'in') {
              await store.clockIn(payload)
            } else {
              await store.clockOut(payload)
            }

            showToast(`${actionName} berhasil disubmit.`)
          } catch(err) {
            showToast(err.message || `Gagal melakukan ${actionName}`, 'danger')
          } finally {
            actionLoading.value = false
          }
        }
      }
    ]
  })
  
  await alert.present()
}
</script>

<style scoped>
.attendance-page {
  --background: var(--color-background);
}
.bg-gray-50 {
  --background: #f9fafb;
}

.date-header {
  margin-bottom: var(--space-lg);
}
.date-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs) 0;
}
.shift-subtitle {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  margin: 0;
}

.quick-menu-section {
  margin-top: var(--space-md);
  margin-bottom: var(--space-xl);
}
.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.quick-menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.qm-btn {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}
.qm-btn:active {
  transform: scale(0.96);
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}

.qm-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.qm-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
