<template>
  <div class="dashboard-attendance-card" @click="goToAttendance">
    <div class="card-header">
      <div class="status-badge" :class="statusClass">
        <ion-icon :name="statusIcon" />
        <span>{{ statusText }}</span>
      </div>
      <div class="card-date">{{ currentDate }}</div>
    </div>
    
    <div class="card-body">
      <div class="clock-item" :class="{ 'is-completed': inTime }">
        <div class="clock-icon"><ion-icon name="log-in-outline" /></div>
        <div class="clock-info">
          <span class="clock-label">Clock In</span>
          <span class="clock-time">{{ inTime || '--:--' }}</span>
        </div>
      </div>
      
      <div class="clock-item" :class="{ 'is-completed': outTime }">
        <div class="clock-icon"><ion-icon name="log-out-outline" /></div>
        <div class="clock-info">
          <span class="clock-label">Clock Out</span>
          <span class="clock-time">{{ outTime || '--:--' }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-action">
      <button class="action-btn" :class="btnClass">
        {{ actionText }}
        <ion-icon name="chevron-forward-outline" />
      </button>
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
  if (isCompleted.value) return 'Selesai Hari Ini'
  if (inTime.value) return 'Sudah Clock In'
  return 'Belum Absen'
})

const statusClass = computed(() => {
  if (isCompleted.value) return 'status-success'
  if (inTime.value) return 'status-warning'
  return 'status-inactive'
})

const statusIcon = computed(() => {
  if (isCompleted.value) return 'checkmark-circle'
  if (inTime.value) return 'time'
  return 'alert-circle'
})

const actionText = computed(() => {
  if (isCompleted.value) return 'Lihat Detail'
  if (inTime.value) return 'Clock Out Sekarang'
  return 'Clock In Sekarang'
})

const btnClass = computed(() => {
  if (isCompleted.value) return 'btn-secondary'
  if (inTime.value) return 'btn-danger'
  return 'btn-primary'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
})

const goToAttendance = () => {
  router.push('/app/attendance')
}
</script>

<style scoped>
.dashboard-attendance-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  margin: 0 var(--space-md) var(--space-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-attendance-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-inactive {
  background: var(--color-danger-subtle);
  color: var(--color-danger);
}

.status-warning {
  background: var(--color-warning-subtle, #fef08a);
  color: #854d0e;
}

.status-success {
  background: var(--color-success-subtle);
  color: var(--color-success);
}

.card-date {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-tertiary);
}

.card-body {
  display: flex;
  gap: 12px;
}

.clock-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-background);
  padding: 10px 12px;
  border-radius: 12px;
  border-left: 3px solid var(--color-border);
}

.clock-item.is-completed {
  border-left-color: var(--color-success);
}

.clock-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.clock-item.is-completed .clock-icon {
  color: var(--color-success);
}

.clock-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.clock-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

.clock-time {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.card-action {
  width: 100%;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text-secondary);
}
</style>
