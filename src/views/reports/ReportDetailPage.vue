<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/reports/my" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Detail Laporan</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content color="light">
      <div v-if="isLoading" class="ion-padding ion-text-center">
        <ion-spinner></ion-spinner>
      </div>
      
      <div v-else-if="report" class="ion-padding">
        <div class="detail-card">
          <div class="card-header">
            <div>
              <h2 class="student-name">{{ report.student?.full_name }}</h2>
              <p class="student-nis">NIS: {{ report.student?.nis || '-' }}</p>
            </div>
            <ReportStatusBadge :status="report.status" />
          </div>

          <div class="info-group">
            <span class="info-label">Kategori Laporan</span>
            <span class="info-value">
              <ion-badge :color="type === 'violation' ? 'danger' : 'success'">
                {{ type === 'violation' ? 'Pelanggaran' : 'Kelakuan Positif' }}
              </ion-badge>
            </span>
          </div>

          <div class="info-group">
            <span class="info-label">Tanggal Kejadian</span>
            <div class="info-value with-icon">
              <ion-icon :icon="calendarOutline"></ion-icon>
              {{ formatDate(report.date) }}
            </div>
          </div>

          <div class="info-group" v-if="report.location">
            <span class="info-label">Lokasi</span>
            <div class="info-value with-icon">
              <ion-icon :icon="locationOutline"></ion-icon>
              {{ report.location }}
            </div>
          </div>

          <div class="info-group description-box">
            <span class="info-label">Keterangan</span>
            <p class="description-text">{{ report.description }}</p>
          </div>
        </div>

        <div class="detail-card photo-card" v-if="photoUrl">
          <h3 class="section-title">Foto Bukti</h3>
          <img :src="photoUrl" class="proof-image" alt="Bukti Foto" />
        </div>

        <div class="detail-card admin-card" v-if="report.status !== 'PENDING'">
          <h3 class="section-title">Info Review</h3>
          <p class="review-info">Laporan ini telah direview oleh sistem/Admin.</p>
          <p class="review-info" v-if="report.points"><strong>Poin diberikan:</strong> {{ report.points }}</p>
          <p class="review-info" v-if="report.type?.name"><strong>Kategori:</strong> {{ report.type.name }}</p>
        </div>
      </div>

      <div v-else class="ion-padding ion-text-center">
        <p>Laporan tidak ditemukan.</p>
        <ion-button fill="outline" router-link="/app/reports/my">Kembali</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonSpinner, IonBadge, IonIcon, IonButton
} from '@ionic/vue'
import { calendarOutline, locationOutline } from 'ionicons/icons'
import { mobileReportsApi } from '@/api/mobileReports.api'
import ReportStatusBadge from '@/components/reports/ReportStatusBadge.vue'

const route = useRoute()
const type = route.params.type // 'violation' | 'positive'
const id = route.params.id

const report = ref(null)
const isLoading = ref(true)

const photoUrl = computed(() => {
  if (!report.value?.photo) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  // Use public URL for proxying through backend or straight to minio
  return `${baseUrl}/public/uploads/${report.value.photo}`
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const loadData = async () => {
  try {
    let res
    if (type === 'violation') {
      res = await mobileReportsApi.getViolationDetail(id)
    } else {
      res = await mobileReportsApi.getPositivePointDetail(id)
    }
    report.value = res.data?.data
  } catch (err) {
    console.error('Load detail failed', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
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

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.student-name {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.student-nis {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.info-group {
  margin-bottom: 16px;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 6px;
}

.info-value {
  font-size: 15px;
  color: #111827;
}

.with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.with-icon ion-icon {
  color: #9ca3af;
}

.description-box {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 0;
}

.description-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #111827;
}

.proof-image {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.admin-card {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.review-info {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e3a8a;
}
.review-info:last-child {
  margin-bottom: 0;
}
</style>
