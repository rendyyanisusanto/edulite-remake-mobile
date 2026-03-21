<template>
  <div class="clock-action-card">
    <button 
      class="clock-btn" 
      :class="[actionType, { 'is-disabled': disabled || loading }]"
      :disabled="disabled || loading"
      @click="$emit('clock-action')"
    >
      <div v-if="loading" class="spinner-wrap"><ion-spinner name="crescent" /></div>
      <template v-else>
        <div class="icon-wrap">
          <ion-icon :name="iconName" />
        </div>
        <span class="btn-text">{{ labelText }}</span>
      </template>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IonIcon, IonSpinner } from '@ionic/vue'

const props = defineProps({
  actionType: {
    type: String, // 'in', 'out', or 'done'
    required: true
  },
  loading: Boolean,
  disabled: Boolean
})

defineEmits(['clock-action'])

const iconName = computed(() => {
  if (props.actionType === 'done') return 'checkmark-circle'
  if (props.actionType === 'out') return 'log-out'
  return 'log-in'
})

const labelText = computed(() => {
  if (props.actionType === 'done') return 'Selesai Hari Ini'
  if (props.actionType === 'out') return 'CLOCK OUT'
  return 'CLOCK IN'
})
</script>

<style scoped>
.clock-action-card {
  margin-bottom: var(--space-lg);
}

.clock-btn {
  width: 100%;
  height: 64px;
  border-radius: var(--radius-lg);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.05em;
  transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.clock-btn:active:not(.is-disabled) {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.clock-btn.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Specific styling for types */
.clock-btn.in {
  background: var(--color-primary);
  color: white;
}

.clock-btn.out {
  background: var(--color-danger);
  color: white;
}

.clock-btn.done {
  background: var(--color-surface);
  color: var(--color-success);
  border: 2px solid var(--color-success-subtle);
  box-shadow: none;
}

.icon-wrap {
  font-size: 24px;
  display: flex;
}
.spinner-wrap {
  color: white;
}
</style>
