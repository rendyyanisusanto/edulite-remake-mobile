<template>
  <div class="list-card pressable" @click="$emit('click')">
    <!-- Left accent -->
    <div v-if="accent" class="list-card__accent" :style="{ background: accent }" />

    <!-- Avatar or icon -->
    <div v-if="avatar || icon" class="list-card__lead">
      <div v-if="avatar" class="list-card__avatar">
        <span>{{ avatarInitials }}</span>
      </div>
      <div v-else-if="icon" class="list-card__icon-wrap" :style="{ background: iconBg }">
        <ion-icon :name="icon" :style="{ color: iconColor }" />
      </div>
    </div>

    <!-- Main content -->
    <div class="list-card__body">
      <div class="list-card__top">
        <span class="list-card__title">{{ title }}</span>
        <slot name="badge" />
      </div>
      <p v-if="subtitle" class="list-card__subtitle">{{ subtitle }}</p>
      <p v-if="meta" class="list-card__meta">{{ meta }}</p>
    </div>

    <!-- Right arrow -->
    <ion-icon
      v-if="showArrow"
      name="chevron-forward-outline"
      class="list-card__arrow"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  meta: { type: String, default: '' },
  avatar: { type: String, default: '' },
  icon: { type: String, default: '' },
  iconColor: { type: String, default: 'var(--color-primary)' },
  iconBg: { type: String, default: 'var(--color-primary-subtle)' },
  accent: { type: String, default: '' },
  showArrow: { type: Boolean, default: true }
})

defineEmits(['click'])

const avatarInitials = computed(() => {
  if (!props.avatar) return ''
  return props.avatar.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})
</script>

<style scoped>
.list-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-sm) var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
  transition: transform var(--transition-fast);
}

.list-card:active { transform: scale(0.985); }

.list-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}

.list-card__lead { flex-shrink: 0; }

.list-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.list-card__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-card__icon-wrap ion-icon {
  font-size: 20px;
}

.list-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
}

.list-card__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-card__subtitle {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-card__meta {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.list-card__arrow {
  color: var(--color-text-tertiary);
  font-size: 16px;
  flex-shrink: 0;
}
</style>
