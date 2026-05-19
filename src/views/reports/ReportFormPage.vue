<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/reports" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Buat Laporan</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content color="light">
      <div class="custom-tabs-container">
        <div class="custom-tabs">
          <div 
            class="tab-btn" 
            :class="{ active: activeTab === 'violation', 'violation': activeTab === 'violation' }"
            @click="activeTab = 'violation'"
          >
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            Pelanggaran
          </div>
          <div 
            class="tab-btn" 
            :class="{ active: activeTab === 'positive', 'positive': activeTab === 'positive' }"
            @click="activeTab = 'positive'"
          >
            <ion-icon :icon="starOutline"></ion-icon>
            Poin Positif
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="report-form ion-padding">
        
        <div class="form-section">
          <!-- Student Selector -->
          <StudentSelectorField v-model="form.student_id" />
        </div>

        <div class="form-section">
          <!-- Date -->
          <ion-item lines="none" class="input-item">
            <ion-icon :icon="calendarOutline" slot="start" color="medium"></ion-icon>
            <ion-input type="date" v-model="form.date" label="Tanggal Kejadian" label-placement="floating" required></ion-input>
          </ion-item>

          <!-- Location -->
          <ion-item lines="none" class="input-item">
            <ion-icon :icon="locationOutline" slot="start" color="medium"></ion-icon>
            <ion-input type="text" v-model="form.location" label="Lokasi (Opsional)" label-placement="floating" placeholder="Contoh: Kantin, Lab Komputer"></ion-input>
          </ion-item>

          <!-- Description -->
          <ion-item lines="none" class="input-item">
            <ion-icon :icon="documentTextOutline" slot="start" color="medium"></ion-icon>
            <ion-textarea v-model="form.description" label="Keterangan Lengkap" label-placement="floating" placeholder="Jelaskan detail kejadian..." rows="3" required></ion-textarea>
          </ion-item>
        </div>

        <!-- Photo Upload -->
        <div class="form-section">
          <ReportPhotoUploadField 
            :photo-preview="photoPreview" 
            @pick="selectPhoto" 
            @remove="clearPhoto" 
          />
        </div>

        <div class="form-actions ion-margin-top">
          <ion-button type="submit" expand="block" shape="round" :disabled="isSubmitting">
            <ion-spinner v-if="isSubmitting" name="crescent" class="ion-margin-end"></ion-spinner>
            Kirim Laporan
          </ion-button>
        </div>

      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
  IonSegment, IonSegmentButton, IonLabel, IonContent,
  IonItem, IonInput, IonTextarea, IonIcon, IonButton, 
  IonSpinner, toastController
} from '@ionic/vue'
import { calendarOutline, locationOutline, documentTextOutline, alertCircleOutline, starOutline } from 'ionicons/icons'

import { mobileReportsApi } from '@/api/mobileReports.api'
import { usePhotoUpload } from '@/composables/usePhotoUpload'
import StudentSelectorField from '@/components/reports/StudentSelectorField.vue'
import ReportPhotoUploadField from '@/components/reports/ReportPhotoUploadField.vue'

const router = useRouter()
const { photoPreview, photoFile, selectPhoto, clearPhoto } = usePhotoUpload()

const activeTab = ref('violation')
const isSubmitting = ref(false)

const getToday = () => new Date().toISOString().split('T')[0]

const form = reactive({
  student_id: null,
  date: getToday(),
  location: '',
  description: ''
})

const showToast = async (msg, color = 'success') => {
  const t = await toastController.create({
    message: msg,
    duration: 2500,
    color,
    position: 'top'
  })
  return t.present()
}

const submitForm = async () => {
  if (!form.student_id) {
    return showToast('Siswa wajib dipilih!', 'danger')
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('student_id', form.student_id)
    formData.append('date', form.date)
    formData.append('description', form.description)
    if (form.location) formData.append('location', form.location)
    if (photoFile.value) {
      formData.append('photo', photoFile.value)
    }

    if (activeTab.value === 'violation') {
      await mobileReportsApi.submitViolation(formData)
    } else {
      await mobileReportsApi.submitPositivePoint(formData)
    }

    await showToast('Laporan berhasil dikirim, menunggu review.')
    
    // Reset Form
    form.student_id = null
    form.location = ''
    form.description = ''
    form.date = getToday()
    clearPhoto()

    // Navigate to history
    router.replace(`/app/reports`)

  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Gagal mengirim laporan'
    showToast(msg, 'danger')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modern-toolbar {
  --background: linear-gradient(135deg, var(--color-primary, #3b82f6) 0%, #1e40af 100%);
  --min-height: 56px;
}

.back-btn-wrapper {
  margin-left: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.back-btn-wrapper:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

ion-back-button {
  --color: #ffffff;
  --icon-font-size: 20px;
}

.modern-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.report-form {
  max-width: 600px;
  margin: 0 auto;
  padding-top: 16px;
}

.custom-tabs-container {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.custom-tabs {
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  position: relative;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn ion-icon {
  font-size: 18px;
}

.tab-btn.active.violation {
  background: white;
  color: #e11d48;
  box-shadow: 0 2px 8px rgba(225, 29, 72, 0.15);
}

.tab-btn.active.positive {
  background: white;
  color: #059669;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.15);
}

.form-section {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
  border: 1px solid #f8fafc;
}

.input-item {
  --background: transparent;
  border-bottom: 1px solid #f1f5f9;
}

.input-item:last-child {
  border-bottom: none;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;
}

.form-actions ion-button {
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
</style>
