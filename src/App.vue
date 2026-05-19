<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useAppStore } from '@/store/app.store'

const appStore = useAppStore()

onMounted(() => {
  appStore.fetchSchoolProfile()
})

// Watch for school name changes to update document title
watch(() => appStore.schoolName, (newName) => {
  if (newName) {
    document.title = newName
  }
}, { immediate: true })

// Watch for school logo changes to update favicon
watch(() => appStore.schoolLogo, (newLogo) => {
  if (newLogo) {
    let link = document.querySelector("link[rel*='icon']")
    if (!link) {
      link = document.createElement('link')
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      document.getElementsByTagName('head')[0].appendChild(link)
    }
    link.href = newLogo
  }
}, { immediate: true })
</script>
