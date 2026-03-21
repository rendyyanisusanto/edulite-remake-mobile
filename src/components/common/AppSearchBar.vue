<template>
  <div class="search-bar-wrap">
    <ion-searchbar
      v-model="searchValue"
      :placeholder="placeholder"
      :debounce="debounce"
      inputmode="search"
      enterkeyhint="search"
      class="app-searchbar"
      @ionInput="$emit('search', searchValue)"
      @ionClear="$emit('search', '')"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { IonSearchbar } from '@ionic/vue'

const props = defineProps({
  placeholder: { type: String, default: 'Cari...' },
  debounce: { type: Number, default: 400 },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  searchValue.value = val
})

watch(searchValue, (val) => {
  emit('update:modelValue', val)
})
</script>

<style scoped>
.search-bar-wrap {
  padding: 0 var(--space-md) var(--space-sm);
}

.app-searchbar {
  --background: var(--color-surface);
  --border-radius: var(--radius-sm);
  --box-shadow: var(--shadow-xs);
  --placeholder-color: var(--color-text-tertiary);
  --icon-color: var(--color-text-tertiary);
  --clear-button-color: var(--color-text-tertiary);
  padding: 0;
}
</style>
