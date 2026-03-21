<template>
  <div class="dashboard-attendance-card" :class="stateClass" @click="goToAttendance">
    
    <div class="card-left">
      <div class="header-date">
        <ion-icon name="calendar-clear-outline"></ion-icon>
        <span>{{ currentDate }}</span>
      </div>
      <div class="status-pill">
        <div class="status-dot"></div>
        {{ statusText }}
      </div>
    </div>

    <div class="card-right">
      <div class="time-row">
        <span class="t-label">IN</span>
        <span class="t-value" :class="{'has-val': inTime}">{{ inTime || '--:--' }}</span>
      </div>
      <div class="time-row">
        <span class="t-label">OUT</span>
        <span class="t-value" :class="{'has-val': outTime}">{{ outTime || '--:--' }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { useAttendanceStore } from '@/store/attendance.store'

const router = useRouter()
const store = useAttendanceStore()

onMounted(async () => {
  if (!store.todayInfo) {
    try {
      await store.fetchTodayInfo()
    } catch(e) {}
  }
})

const inTime = computed(() => {
  if (!store.clockInTime) return null
  return new Date(store.clockInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
})

const outTime = computed(() => {
  if (!store.clockOutTime) return null
  return new Date(store.clockOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
})

const isCompleted = computed(() => !!inTime.value && !!outTime.value)

const statusText = computed(() => {
  if (isCompleted.value) return 'Selesai'
  if (inTime.value) return 'Sedang Bekerja'
  return 'Belum Absen'
})

const stateClass = computed(() => {
  if (isCompleted.value) return 'state-done'
  if (inTime.value) return 'state-working'
  return 'state-idle'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
})

const goToAttendance = () => {
  router.push('/app/attendance')
}
</script>

<style scoped>
.dashboard-attendance-card {
  border-radius: 20px;
  margin: 0 16px 24px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
  cursor: pointer;
}

.dashboard-attendance-card:active {
  transform: scale(0.97);
}

/* --- Dynamic Global Card States --- */
.state-idle {
  background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
  border: 1px solid rgba(239, 68, 68, 0.15); /* Soft Red Border */
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.05); /* Softer Red Shadow */
}
.state-idle .status-pill { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }
.state-idle .status-dot { background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.6); }
.state-idle .t-label { background: rgba(239, 68, 68, 0.08); color: #dc2626; box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.1) inset; }

.state-working {
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  border: 1px solid rgba(245, 158, 11, 0.15);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.05);
}
.state-working .status-pill { background: rgba(245, 158, 11, 0.15); color: #b45309; }
.state-working .status-dot { background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.6); }
.state-working .t-label { background: rgba(245, 158, 11, 0.12); color: #d97706; box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.15) inset; }

.state-done {
  background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.05);
}
.state-done .status-pill { background: rgba(16, 185, 129, 0.15); color: #047857; }
.state-done .status-dot { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.6); }
.state-done .t-label { background: rgba(16, 185, 129, 0.1); color: #059669; box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.15) inset; }

/* --- Left Side Items --- */
.card-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.header-date ion-icon {
  font-size: 15px;
  color: var(--color-text-tertiary);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  width: fit-content;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* --- Right Side Items --- */
.card-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  border-left: 2px dashed rgba(0, 0, 0, 0.06);
  padding-left: 16px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.t-label {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.t-value {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary);
  opacity: 0.4; /* dim if '--:--' */
  min-width: 48px;
  text-align: right;
  letter-spacing: 0.3px;
}

.t-value.has-val {
  opacity: 1; /* full brightness if time is present */
}
</style>
