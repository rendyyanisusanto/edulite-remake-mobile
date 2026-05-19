<template>
  <ion-badge :color="badgeColor" class="status-badge">{{ badgeText }}</ion-badge>
</template>

<script setup>
import { computed } from 'vue'
import { IonBadge } from '@ionic/vue'

const props = defineProps({
  status: { type: String, required: true }
})

const badgeColor = computed(() => {
  const s = props.status?.toUpperCase()
  if (s === 'PENDING') return 'warning'
  if (s === 'APPROVED') return 'success'
  if (s === 'REJECTED') return 'danger'
  return 'medium'
})

const badgeText = computed(() => {
  const s = props.status?.toUpperCase()
  if (s === 'PENDING') return 'Menunggu Review'
  if (s === 'APPROVED') return 'Disetujui'
  if (s === 'REJECTED') return 'Ditolak'
  return s || 'N/A'
})
</script>

<style scoped>
.status-badge {
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
}
</style>
