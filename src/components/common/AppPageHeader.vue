<template>
  <div class="page-header">
    <ion-button
      v-if="showBack"
      fill="clear"
      class="page-header__back"
      @click="$router.back()"
    >
      <ion-icon slot="icon-only" name="chevron-back-outline" />
    </ion-button>
    <div class="page-header__title-group">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { IonButton, IonIcon } from '@ionic/vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  showBack: { type: Boolean, default: false }
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-md) var(--space-sm);
  background: var(--color-background);
}

.page-header__back {
  --color: var(--color-text-primary);
  --padding-start: 0;
  --padding-end: 0;
  margin: 0;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.page-header__title-group {
  flex: 1;
  min-width: 0;
}

.page-header__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.page-header__subtitle {
  margin: 3px 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}
</style>
