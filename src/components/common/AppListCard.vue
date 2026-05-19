<template>
  <div class="list-card pressable" @click="$emit('click')">
    <!-- Left accent string -->
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
      <div v-if="meta" class="list-card__meta">
        <span class="meta-pill">{{ meta }}</span>
      </div>
    </div>

    <!-- Right arrow -->
    <div v-if="showArrow" class="list-card__arrow-wrap">
      <ion-icon name="chevron-forward-outline" class="list-card__arrow" />
    </div>
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
  gap: 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-card:active {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.list-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  border-radius: 5px 0 0 5px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.list-card__lead {
  flex-shrink: 0;
}

.list-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-primary-subtle) 0%, rgba(200, 220, 255, 0.5) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: var(--color-primary);
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.05);
}

.list-card__icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.4);
}

.list-card__icon-wrap ion-icon {
  font-size: 22px;
}

.list-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.list-card__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.list-card__subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-card__meta {
  margin-top: 4px;
}

.meta-pill {
  display: inline-block;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.list-card__arrow-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.list-card:active .list-card__arrow-wrap {
  background: rgba(0,0,0,0.08); /* Darken gently on press */
}

.list-card__arrow {
  color: var(--color-text-secondary);
  font-size: 16px;
  margin-left: 2px;
}
</style>
