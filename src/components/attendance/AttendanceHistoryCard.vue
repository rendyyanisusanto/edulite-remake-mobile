<template>
  <AppListCard
    :title="formattedDateTitle"
    :subtitle="timeSubtitle"
    :meta="durationText"
    icon="time-outline"
    icon-bg="var(--color-primary-subtle)"
    icon-color="var(--color-primary)"
    :accent="accentColor"
    @click="$emit('click')"
  >
    <template #badge>
      <AppStatusBadge :status="mappedStatusBadgeInfo.status" :label="mappedStatusBadgeInfo.label" />
    </template>
  </AppListCard>
</template>

<script setup>
import { computed } from 'vue'
import AppListCard from '@/components/common/AppListCard.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'

const props = defineProps({
  date: String,
  inTime: String,
  outTime: String,
  status: String,
  durationMinutes: Number
})

defineEmits(['click'])

// Format Date as Title: "12 Oct 2026"
const formattedDateTitle = computed(() => {
  if (!props.date) return '-'
  return new Date(props.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
})

// Format time as "07:30 - 15:00"
const formatTime = (isoString) => {
  if (!isoString) return '--:--'
  return new Date(isoString).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
}

const timeSubtitle = computed(() => {
  return `${formatTime(props.inTime)} — ${formatTime(props.outTime)}`
})

// Duration as Meta
const durationText = computed(() => {
  if (!props.durationMinutes) return ''
  const h = Math.floor(props.durationMinutes / 60)
  const m = props.durationMinutes % 60
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
})

// Ensure compatible mapping with AppStatusBadge
// AppStatusBadge uses: active(success), pending(warning), approved(success), rejected(danger), completed(primary), etc.
const mappedStatusBadgeInfo = computed(() => {
  switch (props.status) {
    case 'PRESENT': return { status: 'approved', label: 'Hadir' }
    case 'LATE': return { status: 'pending', label: 'Terlambat' }
    case 'INCOMPLETE': return { status: 'pending', label: 'Tidak Lengkap' }
    case 'ABSENT': return { status: 'rejected', label: 'Alpha' }
    case 'EXCUSED': return { status: 'info', label: 'Izin/Sakit' }
    default: return { status: 'neutral', label: props.status || 'Belum Absen' }
  }
})

// Add Left Accent color matching the status
const accentColor = computed(() => {
  switch (props.status) {
    case 'PRESENT': return 'var(--color-success)'
    case 'LATE': return 'var(--color-warning)'
    case 'INCOMPLETE': return 'var(--color-warning)'
    case 'ABSENT': return 'var(--color-danger)'
    case 'EXCUSED': return 'var(--color-info)'
    default: return 'var(--color-border)'
  }
})
</script>
