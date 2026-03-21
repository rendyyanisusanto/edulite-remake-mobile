<template>
  <button class="menu-item pressable" :style="{ '--card-color': color }" @click="$emit('click')">
    <div class="menu-item__icon-wrap">
      <ion-icon :name="icon" class="menu-item__icon" />
    </div>
    <span class="menu-item__title">{{ title }}</span>
  </button>
</template>

<script setup>
import { IonIcon } from '@ionic/vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'grid-outline' },
  color: { type: String, default: '#2563EB' }
})

defineEmits(['click'])
</script>

<style scoped>
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 0;
  width: 100%;
  cursor: pointer;
  outline: none;
}

.menu-item:active .menu-item__icon-wrap {
  transform: scale(0.9);
  opacity: 0.9;
}

.menu-item__icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); /* Soft, elegant shadow */
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.menu-item__icon {
  font-size: 26px;
  color: var(--card-color);
}

.menu-item__title {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-primary);
  text-align: center;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
  padding: 0 2px;
}
</style>
