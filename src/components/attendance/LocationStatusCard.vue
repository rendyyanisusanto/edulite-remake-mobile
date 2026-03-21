<template>
  <div class="location-status-card">
    <div class="loc-header">
      <div class="loc-title">
        <ion-icon name="location" class="loc-icon" :class="isInside ? 'valid' : 'invalid'" />
        <span>Validasi Lokasi</span>
      </div>
      <button class="refresh-btn" @click="$emit('refresh')" :disabled="loading">
        <ion-icon name="refresh" :class="{ 'spin': loading }" />
      </button>
    </div>

    <div v-if="loading" class="loc-body loading-state">
      <ion-spinner name="crescent" color="primary"></ion-spinner>
      <span>Mencari lokasi...</span>
    </div>

    <div v-else-if="error" class="loc-body error-state">
      <p class="error-text">{{ error }}</p>
    </div>

    <div v-else class="loc-body success-state">
      <div class="status-banner" :class="isInside ? 'banner-success' : 'banner-warning'">
        <ion-icon :name="isInside ? 'checkmark-circle' : 'warning'" />
        <span>{{ isInside ? 'Anda berada di dalam area presensi' : 'Anda berada di luar area presensi' }}</span>
      </div>

      <div class="loc-details">
        <div class="detail-row">
          <span class="detail-label">Jarak dari Pusat</span>
          <span class="detail-val" :class="{ 'warning-text': !isInside }">{{ formattedDistance }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Akurasi GPS</span>
          <span class="detail-val">{{ formattedAccuracy }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IonIcon, IonSpinner } from '@ionic/vue'

const props = defineProps({
  loading: Boolean,
  error: String,
  distanceMeters: Number,
  accuracyMeters: Number,
  maxRadius: Number
})

defineEmits(['refresh'])

const isInside = computed(() => {
  if (props.distanceMeters === null) return false
  if (!props.maxRadius) return true
  return props.distanceMeters <= props.maxRadius
})

const formattedDistance = computed(() => {
  if (props.distanceMeters === null) return '-'
  return `${Math.round(props.distanceMeters)} meter`
})

const formattedAccuracy = computed(() => {
  if (props.accuracyMeters === null) return '-'
  return `±${Math.round(props.accuracyMeters)} meter`
})
</script>

<style scoped>
.location-status-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-md);
}

.loc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.loc-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}

.loc-icon {
  font-size: 18px;
}
.loc-icon.valid { color: var(--color-success); }
.loc-icon.invalid { color: var(--color-warning); }

.refresh-btn {
  background: var(--color-background);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 18px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loc-body {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.loading-state {
  align-items: center;
  gap: 12px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.error-state {
  align-items: center;
}

.error-text {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  text-align: center;
  background: var(--color-danger-subtle);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-banner {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-md);
}

.banner-success {
  background: var(--color-success-subtle);
  color: var(--color-success);
}

.banner-warning {
  background: var(--color-warning-subtle, #fef08a);
  color: #854d0e;
}

.loc-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.detail-label {
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.detail-val {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.warning-text {
  color: var(--color-warning);
}
</style>
