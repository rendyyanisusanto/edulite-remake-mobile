<template>
  <ion-page class="positive-detail-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/positive-behaviour" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Detail Perilaku Positif</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" />
      </div>

      <div v-else-if="record" class="content-wrapper">
        <div class="hero-section theme-success">
          <div class="hero-glass">
            <div class="avatar-container">
              <span class="avatar-text">{{ avatarInitials }}</span>
            </div>
            <h1 class="student-name">{{ record.student?.full_name || '-' }}</h1>
            <p class="student-nis">
              NIS: {{ record.student?.nis || '-' }}
              <span v-if="record.className">• {{ record.className }}</span>
            </p>
            <div class="badge-row">
              <span class="type-badge">{{ record.type?.name || 'Menunggu penentuan kategori' }}</span>
              <span class="status-badge">{{ statusLabel }}</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <div class="detail-card animate-slide-up">
            <div class="card-header">
              <ion-icon :icon="starOutline" class="header-icon" />
              <h2>Informasi Perilaku Positif</h2>
            </div>
            <div class="card-body">
              <div class="data-row">
                <span class="data-label">Tanggal Kejadian</span>
                <span class="data-value">{{ formatDate(record.date) }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Lokasi</span>
                <span class="data-value">{{ record.location || 'Tidak dicantumkan' }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Poin</span>
                <span class="data-value">+{{ record.type?.point || 0 }} poin</span>
              </div>
              <div class="data-row">
                <span class="data-label">Kategori</span>
                <span class="data-value">{{ record.type?.name || 'Belum ditentukan' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card animate-slide-up" style="animation-delay: 0.1s">
            <div class="card-header">
              <ion-icon :icon="documentTextOutline" class="header-icon" />
              <h2>Keterangan</h2>
            </div>
            <div class="card-body">
              <p class="description-text">{{ record.description || 'Tidak ada keterangan.' }}</p>
            </div>
          </div>

          <div v-if="record.photo" class="detail-card animate-slide-up" style="animation-delay: 0.2s">
            <div class="card-header">
              <ion-icon :icon="imageOutline" class="header-icon" />
              <h2>Foto Bukti</h2>
            </div>
            <div class="card-body">
              <img :src="photoUrl" alt="Foto bukti perilaku positif" class="proof-image" />
            </div>
          </div>

          <div class="detail-card animate-slide-up" style="animation-delay: 0.3s">
            <div class="card-header">
              <ion-icon :icon="informationCircleOutline" class="header-icon" />
              <h2>Status Laporan</h2>
            </div>
            <div class="card-body">
              <div class="data-row">
                <span class="data-label">Status</span>
                <span class="data-value">{{ statusLabel }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Pelapor</span>
                <span class="data-value">{{ record.creator?.name || 'Anda' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <ion-icon :icon="starOutline" class="error-icon" />
        <p>Data perilaku positif tidak ditemukan.</p>
        <ion-button @click="router.back()" fill="clear">Kembali</ion-button>
      </div>

      <div style="height: 40px;" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonTitle, IonToolbar, onIonViewWillEnter } from '@ionic/vue'
import { documentTextOutline, imageOutline, informationCircleOutline, starOutline } from 'ionicons/icons'
import { mobileReportsApi } from '@/api/mobileReports.api'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const record = ref(null)

const STATUS_LABELS = {
  open: 'Terbuka',
  pending: 'Menunggu Review',
  resolved: 'Selesai',
  approved: 'Disetujui',
  pending_review: 'Menunggu Review',
  verified: 'Terverifikasi',
  unverified: 'Belum Verifikasi'
}

const avatarInitials = computed(() => {
  const name = record.value?.student?.full_name || ''
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase()
})

const statusLabel = computed(() => {
  const status = String(record.value?.status || 'pending').toLowerCase()
  return STATUS_LABELS[status] || record.value?.status || 'Menunggu Review'
})

const photoUrl = computed(() => {
  if (!record.value?.photo) return ''
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return `${baseUrl}/public/uploads/${record.value.photo}`
})

function formatDate(dateString) {
  if (!dateString) return 'Belum diisi'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return 'Format salah'
  }
}

function resolveClassName(payload) {
  return payload?.student?.class_name
    || payload?.student?.class_history?.[0]?.class_info?.name
    || ''
}

async function fetchDetails() {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    const { data } = await mobileReportsApi.getPositivePointDetail(id)
    const payload = data.data || null
    record.value = payload ? { ...payload, className: resolveClassName(payload) } : null
  } catch (error) {
    console.error('Failed to fetch positive point details', error)
    record.value = null
  } finally {
    loading.value = false
  }
}

onIonViewWillEnter(fetchDetails)
</script>

<style scoped>
.positive-detail-page {
  --background: #f8fafc;
}

.modern-toolbar {
  --background: linear-gradient(135deg, #10b981 0%, #047857 100%);
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

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  flex-direction: column;
  color: var(--color-text-secondary);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.hero-section {
  position: relative;
  padding-top: 24px;
  padding-bottom: 40px;
  overflow: hidden;
}

.hero-section::before,
.hero-section::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  z-index: 0;
}

.hero-section::before {
  width: 180px;
  height: 180px;
  top: -40px;
  right: -40px;
}

.hero-section::after {
  width: 120px;
  height: 120px;
  bottom: -30px;
  left: -20px;
}

.theme-success {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.hero-glass {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  margin: 0 20px;
  border-radius: 20px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.avatar-container {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-text {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
}

.student-name {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
}

.student-nis {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 16px;
}

.badge-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.type-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}

.details-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
  position: relative;
  z-index: 2;
}

.detail-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.card-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.header-icon {
  font-size: 20px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px;
  border-radius: 8px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-label {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-value {
  font-size: 15px;
  color: var(--color-text-primary);
  font-weight: 500;
  line-height: 1.4;
}

.description-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.proof-image {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}

.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
