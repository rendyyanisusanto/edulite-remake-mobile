<template>
  <div class="attendance-status-card">
    <div class="card-header">
      <div class="header-left">
        <AppStatusBadge :status="mappedStatus" :label="mappedLabel" />
      </div>
      <div v-if="durationMinutes > 0" class="duration-badge">
        <ion-icon name="time-outline" />
        <span>{{ durationText }}</span>
      </div>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'

const props = defineProps({
  status: {
    type: String,
    default: 'Belum Absen'
  },
  inTime: {
    type: String,
    default: null
  },
  outTime: {
    type: String,
    default: null
  },
  durationMinutes: {
    type: Number,
    default: 0
  }
})

const durationText = computed(() => {
  if (!props.durationMinutes) return '-'
  const h = Math.floor(props.durationMinutes / 60)
  const m = props.durationMinutes % 60
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
})

const mappedStatus = computed(() => {
  switch (props.status) {
    case 'PRESENT': return 'approved'
    case 'LATE': return 'pending'
    case 'INCOMPLETE': return 'pending'
    case 'ABSENT': return 'rejected'
    case 'EXCUSED': return 'info'
    default: return 'neutral'
  }
})

const mappedLabel = computed(() => {
  switch (props.status) {
    case 'PRESENT': return 'Hadir'
    case 'LATE': return 'Terlambat'
    case 'INCOMPLETE': return 'Tidak Lengkap'
    case 'ABSENT': return 'Alpha'
    case 'EXCUSED': return 'Izin/Sakit'
    default: return props.status || 'Belum Absen'
  }
})
</script>

<style scoped>
.attendance-status-card {
  background: var(--color-surface);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: var(--space-lg);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.duration-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 800;
  color: var(--color-primary);
  background: var(--color-primary-subtle);
  padding: 6px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.duration-badge ion-icon {
  font-size: 16px;
}

.card-body {
  display: flex;
  gap: 12px;
}

.clock-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  padding: 14px 12px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clock-item.is-completed {
  border-color: rgba(16, 185, 129, 0.2);
  background: linear-gradient(145deg, #ffffff, #f0fdf4);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.06);
}

.clock-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  transition: all 0.3s ease;
}

.clock-icon ion-icon {
  font-size: 20px;
}

.clock-item.is-completed .clock-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.clock-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.clock-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clock-item.is-completed .clock-label {
  color: var(--color-success);
}

.clock-time {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary);
}
</style>
