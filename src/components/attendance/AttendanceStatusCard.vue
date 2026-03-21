<template>
  <div class="attendance-status-card">
    <div class="status-header">
      <div class="status-title">Status Hari Ini</div>
      <AppStatusBadge :status="mappedStatus" :label="mappedLabel" />
    </div>

    <div class="status-grid">
      <div class="status-item">
        <span class="label">Clock In</span>
        <span class="value" :class="{ 'has-value': inTime }">{{ inTime || '--:--' }}</span>
      </div>
      <div class="status-item">
        <span class="label">Clock Out</span>
        <span class="value" :class="{ 'has-value': outTime }">{{ outTime || '--:--' }}</span>
      </div>
      <div class="status-item">
        <span class="label">Durasi Kerja</span>
        <span class="value highlight">{{ durationText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-md);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.status-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.label {
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

.value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.value.has-value, .value.highlight {
  color: var(--color-text-primary);
}
</style>
