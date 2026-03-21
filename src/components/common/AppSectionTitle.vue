<template>
  <div class="section-title">
    <div class="section-title__left">
      <div v-if="icon" class="section-title__icon">
        <ion-icon :name="icon" />
      </div>
      <span class="section-title__text">{{ title }}</span>
    </div>
    <button v-if="actionLabel" class="section-title__action" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
import { IonIcon } from '@ionic/vue'

defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  actionLabel: { type: String, default: '' }
})

defineEmits(['action'])
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-md) var(--space-sm);
}

.section-title__left {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.section-title__icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title__icon ion-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.section-title__text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.section-title__action {
  background: none;
  border: none;
  padding: 4px 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  cursor: pointer;
  font-family: var(--font-family);
}
</style>
