<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <ion-icon :name="icon" />
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p class="empty-state__desc">{{ description }}</p>
    <ion-button
      v-if="actionLabel"
      fill="outline"
      size="small"
      class="empty-state__action"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </ion-button>
  </div>
</template>

<script setup>
import { IonIcon, IonButton } from '@ionic/vue'

defineProps({
  icon: { type: String, default: 'document-outline' },
  title: { type: String, default: 'Tidak ada data' },
  description: { type: String, default: 'Belum ada data yang tersedia saat ini.' },
  actionLabel: { type: String, default: '' }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-xl) var(--space-lg);
  gap: var(--space-sm);
}

.empty-state__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-primary-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-sm);
}

.empty-state__icon ion-icon {
  font-size: 36px;
  color: var(--color-primary);
  opacity: 0.6;
}

.empty-state__title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.empty-state__desc {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-base);
  max-width: 260px;
}

.empty-state__action {
  margin-top: var(--space-sm);
  --border-radius: var(--radius-sm);
}
</style>
