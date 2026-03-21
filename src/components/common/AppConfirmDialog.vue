<template>
  <ion-alert
    :is-open="isOpen"
    :header="title"
    :message="message"
    :buttons="alertButtons"
    @did-dismiss="$emit('cancel')"
  />
</template>

<script setup>
import { computed } from 'vue'
import { IonAlert } from '@ionic/vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: 'Apakah Anda yakin?' },
  confirmLabel: { type: String, default: 'Ya, Lanjutkan' },
  cancelLabel: { type: String, default: 'Batal' },
  confirmColor: { type: String, default: 'danger' }
})

const emit = defineEmits(['confirm', 'cancel'])

const alertButtons = computed(() => [
  {
    text: props.cancelLabel,
    role: 'cancel',
    handler: () => emit('cancel')
  },
  {
    text: props.confirmLabel,
    role: 'confirm',
    cssClass: `alert-confirm-${props.confirmColor}`,
    handler: () => emit('confirm')
  }
])
</script>
