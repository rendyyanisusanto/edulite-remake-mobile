<template>
  <span class="status-badge" :class="`status-badge--${variant}`">
    <span v-if="dot" class="status-badge__dot" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  label: { type: String, default: '' },
  dot: { type: Boolean, default: true }
})

const STATUS_MAP = {
  // Generic
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  draft: 'neutral',
  completed: 'primary',
  cancelled: 'neutral',
  // Violation
  open: 'warning',
  resolved: 'success',
  // Counseling
  ongoing: 'info',
  closed: 'neutral',
  // Positive
  verified: 'success',
  unverified: 'warning'
}

const variant = computed(() => {
  const key = props.status?.toLowerCase()
  return STATUS_MAP[key] || 'neutral'
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Variants */
.status-badge--success {
  background: var(--color-success-subtle);
  color: var(--color-success);
}
.status-badge--success .status-badge__dot { background: var(--color-success); }

.status-badge--warning {
  background: var(--color-warning-subtle);
  color: #B45309;
}
.status-badge--warning .status-badge__dot { background: var(--color-warning); }

.status-badge--danger {
  background: var(--color-danger-subtle);
  color: var(--color-danger);
}
.status-badge--danger .status-badge__dot { background: var(--color-danger); }

.status-badge--info {
  background: var(--color-info-subtle);
  color: var(--color-info);
}
.status-badge--info .status-badge__dot { background: var(--color-info); }

.status-badge--primary {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}
.status-badge--primary .status-badge__dot { background: var(--color-primary); }

.status-badge--neutral {
  background: #F1F5F9;
  color: var(--color-text-secondary);
}
.status-badge--neutral .status-badge__dot { background: var(--color-text-tertiary); }
</style>
