<template>
  <div class="photo-upload-field ion-padding-vertical">
    <ion-item lines="none" class="transparent-item">
      <ion-icon :icon="cameraOutline" slot="start" color="primary"></ion-icon>
      <ion-label>
        <h3>Foto Bukti (Opsional)</h3>
        <p>Ambil foto atau pilih dari galeri</p>
      </ion-label>
      <ion-button v-if="!photoPreview" fill="outline" slot="end" @click="emit('pick')">
        Tambah
      </ion-button>
    </ion-item>

    <div v-if="photoPreview" class="preview-container ion-padding-horizontal">
      <div class="image-wrapper">
        <img :src="photoPreview" alt="Preview foto" />
        <ion-fab-button size="small" color="danger" class="remove-btn" @click="emit('remove')">
          <ion-icon :icon="closeOutline"></ion-icon>
        </ion-fab-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonItem, IonLabel, IonIcon, IonButton, IonFabButton } from '@ionic/vue'
import { cameraOutline, closeOutline } from 'ionicons/icons'

defineProps({
  photoPreview: { type: String, default: null }
})

const emit = defineEmits(['pick', 'remove'])
</script>

<style scoped>
.transparent-item {
  --background: transparent;
}
.preview-container {
  margin-top: 10px;
}
.image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}
.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
}
</style>
