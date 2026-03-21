<template>
  <AppListCard
    :title="typeLabel"
    :subtitle="formattedDate"
    :meta="`&quot;${reason}&quot;`"
    :icon="typeIcon"
    :icon-color="typeColor"
    :icon-bg="typeBgColor"
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
  type: String, // FORGOT_CLOCK_IN, FORGOT_CLOCK_OUT, MISSED_BOTH, LOCATION_EXCEPTION, TIME_CORRECTION
  date: String,
  reason: String,
  status: String // PENDING, APPROVED, REJECTED, CANCELLED
})

defineEmits(['click'])

const TYPE_CONFIG = {
  FORGOT_CLOCK_IN: { label: 'Lupa Clock In', icon: 'log-in', color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' },
  FORGOT_CLOCK_OUT: { label: 'Lupa Clock Out', icon: 'log-out', color: 'var(--color-danger)', bg: 'var(--color-danger-subtle)' },
  MISSED_BOTH: { label: 'Lupa Keduanya', icon: 'calendar', color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' },
  LOCATION_EXCEPTION: { label: 'Pengecualian Lokasi', icon: 'location', color: 'var(--color-info)', bg: 'var(--color-info-subtle)' },
  TIME_CORRECTION: { label: 'Koreksi Waktu', icon: 'time', color: 'var(--color-secondary)', bg: '#F1F5F9' },
}

const config = computed(() => TYPE_CONFIG[props.type] || { label: props.type, icon: 'document-text', color: 'var(--color-text-secondary)', bg: '#F1F5F9' })

const typeLabel = computed(() => config.value.label)
const typeIcon = computed(() => config.value.icon)
const typeColor = computed(() => config.value.color)
const typeBgColor = computed(() => config.value.bg)

const formattedDate = computed(() => {
  if (!props.date) return '-'
  return new Date(props.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
})

const mappedStatusBadgeInfo = computed(() => {
  switch (props.status) {
    case 'PENDING': return { status: 'pending', label: 'Menunggu' }
    case 'APPROVED': return { status: 'approved', label: 'Disetujui' }
    case 'REJECTED': return { status: 'rejected', label: 'Ditolak' }
    case 'CANCELLED': return { status: 'neutral', label: 'Dibatalkan' }
    default: return { status: 'neutral', label: props.status || 'Draft' }
  }
})

const accentColor = computed(() => {
  switch (props.status) {
    case 'APPROVED': return 'var(--color-success)'
    case 'REJECTED': return 'var(--color-danger)'
    case 'PENDING': return 'var(--color-warning)'
    default: return 'var(--color-border)'
  }
})
</script>
