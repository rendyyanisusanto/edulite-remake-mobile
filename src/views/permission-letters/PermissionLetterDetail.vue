<template>
  <ion-page class="detail-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/permission-letters" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Detail Izin</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" />
      </div>

      <div v-else-if="letter" class="content-wrapper">
        <!-- Hero Header -->
        <div class="hero-section theme-blue">
          <div class="hero-glass">
            <span class="status-badge large-badge" :class="letter.status.toLowerCase()">
              {{ translateStatus(letter.status) }}
            </span>
            <h1 class="activity-name">{{ letter.activity_name }}</h1>
            <p v-if="letter.code" class="letter-code">Kode: {{ letter.code }}</p>
          </div>
        </div>

        <div class="details-section">
          <!-- Main Info Card -->
          <div class="detail-card animate-slide-up">
            <div class="card-header">
              <ion-icon name="information-circle-outline" class="header-icon" />
              <h2>Informasi Kegiatan</h2>
            </div>
            <div class="card-body">
              <div class="data-row">
                <span class="data-label">Tanggal Pelaksanaan</span>
                <span class="data-value">{{ formatMultiDate(letter.start_date, letter.end_date) }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Waktu</span>
                <span class="data-value">{{ formatTime(letter.start_time) }} - {{ formatTime(letter.end_time) }} WIB</span>
              </div>
              <div class="data-row">
                <span class="data-label">Lokasi</span>
                <span class="data-value">{{ letter.location }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Pendamping</span>
                <span class="data-value">{{ letter.companion_name || '-' }}</span>
              </div>
              <div class="data-row" v-if="letter.notes">
                <span class="data-label">Catatan Tambahan</span>
                <span class="data-value notes-text">{{ letter.notes }}</span>
              </div>
            </div>
          </div>

          <!-- Students List Card -->
          <div class="detail-card animate-slide-up" style="animation-delay: 0.1s">
            <div class="card-header">
              <ion-icon name="people-outline" class="header-icon" />
              <h2>Peserta Siswa ({{ letter.students?.length || 0 }})</h2>
            </div>
            <div class="card-body">
              <div v-for="(studentRow, index) in letter.students" :key="studentRow.id" class="student-item">
                <div class="student-avatar">{{ getInitials(studentRow.student?.full_name) }}</div>
                <div class="student-info">
                  <span class="student-name">{{ studentRow.student?.full_name }}</span>
                  <span class="student-nis">NIS: {{ studentRow.student?.nis || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-section animate-slide-up" style="animation-delay: 0.2s">
            <template v-if="letter.status === 'APPROVED' || letter.status === 'FINISHED'">
              <ion-button expand="block" color="success" class="action-btn" @click="downloadPdf" :disabled="loading">
                <ion-spinner v-if="loading" name="crescent" slot="start" />
                <ion-icon v-else name="download-outline" slot="start" />
                Download PDF Surat
              </ion-button>
            </template>

            <template v-if="letter.status === 'DRAFT'">
              <ion-button expand="block" color="primary" class="action-btn" @click="submitLetter">
                <ion-icon name="paper-plane-outline" slot="start" />
                Ajukan Surat Izin
              </ion-button>
              <ion-button expand="block" fill="outline" color="primary" class="action-btn" @click="router.push(`/app/permission-letters/${letter.id}/edit`)">
                <ion-icon name="create-outline" slot="start" />
                Ubah Draft
              </ion-button>
            </template>

            <ion-button 
              v-if="['DRAFT', 'PENDING'].includes(letter.status)" 
              expand="block" 
              fill="clear" 
              color="danger" 
              class="action-btn"
              @click="cancelLetter"
            >
              <ion-icon name="close-circle-outline" slot="start" />
              Batalkan Surat
            </ion-button>
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <ion-icon name="alert-circle-outline" class="error-icon" />
        <p>Data surat izin tidak ditemukan.</p>
        <ion-button @click="router.back()" fill="clear">Kembali</ion-button>
      </div>

      <div style="height: 60px;" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonTitle, IonContent, IonSpinner, alertController } from '@ionic/vue'
import { permissionLettersApi } from '@/api/permission-letters.api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const letter = ref(null)

onMounted(() => {
  fetchDetails()
})

async function fetchDetails() {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const { data } = await permissionLettersApi.getById(id)
    letter.value = data.data || data
  } catch (err) {
    console.error('Failed to fetch letter:', err)
  } finally {
    loading.value = false
  }
}

async function submitLetter() {
  const alert = await alertController.create({
    header: 'Konfirmasi',
    message: 'Apakah Anda yakin ingin mengajukan surat izin ini? Setelah diajukan, data tidak bisa diubah langsung.',
    buttons: [
      { text: 'Batal', role: 'cancel' },
      { text: 'Ajukan', handler: async () => {
          try {
            loading.value = true
            await permissionLettersApi.submit(letter.value.id)
            await fetchDetails()
          } catch(e) { console.error('Error submit', e) }
        }
      }
    ]
  })
  await alert.present()
}

async function downloadPdf() {
  if (!letter.value?.id) return
  
  try {
    loading.value = true
    const response = await permissionLettersApi.printPdf(letter.value.id)
    
    // axios.js in mobile app returns the response object, so blob is in response.data
    const blob = response.data
    const url = window.URL.createObjectURL(blob)
    
    // Open in new tab (best for mobile browsers/Ionic)
    window.open(url, '_blank')
    
    // Cleanup after some time
    setTimeout(() => window.URL.revokeObjectURL(url), 10000)
  } catch (err) {
    console.error('Failed to download PDF:', err)
    const alert = await alertController.create({
      header: 'Gagal',
      message: 'Gagal memuat PDF. Pastikan data surat sudah lengkap.',
      buttons: ['OK']
    })
    await alert.present()
  } finally {
    loading.value = false
  }
}

async function cancelLetter() {
  const alert = await alertController.create({
    header: 'Batalkan',
    message: 'Apakah Anda yakin ingin membatalkan surat ini secara permanen?',
    buttons: [
      { text: 'Tidak', role: 'cancel' },
      { text: 'Ya, Batalkan', role: 'destructive', handler: async () => {
          try {
            loading.value = true
            await permissionLettersApi.cancel(letter.value.id)
            await fetchDetails()
          } catch(e) { console.error('Error cancel', e) }
        }
      }
    ]
  })
  await alert.present()
}

// Helpers
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatMultiDate(start, end) {
  if (!start) return '-'
  const d1 = new Date(start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  if (end && start !== end) {
    const d2 = new Date(end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${d1} - ${d2}`
  }
  return d1
}

function formatTime(timeStr) {
  if (!timeStr) return '-'
  return timeStr.slice(0, 5) // "08:30:00" -> "08:30"
}

function translateStatus(status) {
  const map = {
    'DRAFT': 'Draft',
    'PENDING': 'Menunggu Persetujuan',
    'APPROVED': 'Disetujui',
    'REJECTED': 'Ditolak',
    'CANCELLED': 'Dibatalkan',
    'FINISHED': 'Selesai'
  }
  return map[status] || status
}
</script>

<style scoped>
.detail-page {
  --background: #f8fafc;
}

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

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.error-state {
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
.hero-section::before, .hero-section::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  z-index: 0;
}
.hero-section::before { width: 180px; height: 180px; top: -40px; right: -40px; }
.hero-section::after { width: 120px; height: 120px; bottom: -30px; left: -20px; }

.theme-blue {
  background: linear-gradient(135deg, var(--color-primary) 0%, #1E40AF 100%);
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

.large-badge {
  font-size: 12px;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.3);
}

.large-badge.draft { background: rgba(255,255,255,0.2); color: #fff; }
.large-badge.pending { background: rgba(245, 158, 11, 0.3); color: #fff; border-color: #FCD34D;}
.large-badge.approved { background: rgba(16, 185, 129, 0.3); color: #fff; border-color: #6EE7B7;}
.large-badge.rejected { background: rgba(239, 68, 68, 0.3); color: #fff; border-color: #FCA5A5;}
.large-badge.cancelled { background: rgba(100, 116, 139, 0.4); color: #fff; border-color: #94A3B8;}
.large-badge.finished { background: rgba(16, 185, 129, 0.4); color: #fff; border-color: #6EE7B7;}

.activity-name {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.3;
}
.letter-code {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-family: monospace;
  background: rgba(0,0,0,0.15);
  padding: 4px 12px;
  border-radius: 8px;
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
  color: var(--color-primary);
  background: var(--color-primary-subtle);
  padding: 6px;
  border-radius: 8px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
.notes-text {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  white-space: pre-wrap;
  font-size: 14px;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}
.student-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}
.student-info {
  display: flex;
  flex-direction: column;
}
.student-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.student-nis {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.action-btn {
  --border-radius: 12px;
  margin: 0;
}

/* Animations */
.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
