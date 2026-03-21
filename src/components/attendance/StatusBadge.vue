<template>
  <span class="status-badge" :class="badgeClass">{{ statusText }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const badgeConfig = {
  'PRESENT': { text: 'Hadir', class: 'badge-success' },
  'LATE': { text: 'Terlambat', class: 'badge-warning' },
  'INCOMPLETE': { text: 'Tidak Lengkap', class: 'badge-warning' },
  'ABSENT': { text: 'Belum Hadir / Alpha', class: 'badge-danger' },
  'EXCUSED': { text: 'Izin / Sakit', class: 'badge-info' },
  'Belum Absen': { text: 'Belum Absen', class: 'badge-default' }
}

const config = computed(() => badgeConfig[props.status] || { text: props.status, class: 'badge-default' })

const statusText = computed(() => config.value.text)
const badgeClass = computed(() => config.value.class)
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-success { background: var(--color-success-subtle); color: var(--color-success); }
.badge-warning { background: var(--color-warning-subtle, #fef08a); color: #854d0e; }
.badge-danger { background: var(--color-danger-subtle); color: var(--color-danger); }
.badge-info { background: #e0f2fe; color: #0284c7; }
.badge-default { background: var(--color-surface); color: var(--color-text-tertiary); border: 1px solid var(--color-border); }
</style>
