<template>
  <ion-page class="student-detail-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/students" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Detail Siswa</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" />
      </div>

      <div v-else-if="student" class="content-wrapper">
        <!-- Hero Section -->
        <div class="hero-section" :class="heroThemeClass">
          <div class="hero-glass">
            <div class="avatar-container">
              <span class="avatar-text">{{ avatarInitials }}</span>
            </div>
            <h1 class="student-name">{{ student.full_name }}</h1>
            <p class="student-nis">NIS: {{ student.nis || '-' }} <span v-if="student.nisn">• NISN: {{ student.nisn }}</span></p>
            <div class="badge-row">
              <span class="gender-badge">{{ student.gender === 'MALE' ? 'Laki-Laki' : (student.gender === 'FEMALE' ? 'Perempuan' : 'Tidak Disebutkan') }}</span>
              <span class="status-badge" :class="{ inactive: student.status === 'INACTIVE' }">{{ student.status || 'Aktif' }}</span>
            </div>
          </div>
        </div>

        <!-- Detail Cards -->
        <div class="details-section">
          
          <div class="detail-card animate-slide-up">
            <div class="card-header">
              <ion-icon name="person-outline" class="header-icon" />
              <h2>Data Pribadi</h2>
            </div>
            <div class="card-body">
              <div class="data-row">
                <span class="data-label">Alamat</span>
                <span class="data-value">{{ student.address || 'Belum diisi' }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">Tanggal Lahir</span>
                <span class="data-value">{{ formatDate(student.date_of_birth) }}</span>
              </div>
            </div>
          </div>

          <div v-if="student.parents && student.parents.length" class="detail-card animate-slide-up" style="animation-delay: 0.1s">
            <div class="card-header">
              <ion-icon name="people-outline" class="header-icon" />
              <h2>Data Orang Tua</h2>
            </div>
            <div class="card-body">
              <div v-for="parent in student.parents" :key="parent.id" class="parent-item">
                <div class="data-row">
                  <span class="data-label">{{ parent.relation_type }}</span>
                  <span class="data-value">{{ parent.full_name }}</span>
                </div>
                <div class="data-row" v-if="parent.phone_number">
                  <span class="data-label">Telepon</span>
                  <span class="data-value">{{ parent.phone_number }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="error-state">
        <ion-icon name="alert-circle-outline" class="error-icon" />
        <p>Siswa tidak ditemukan.</p>
        <ion-button @click="router.back()" fill="clear">Kembali</ion-button>
      </div>

      <div style="height: 40px;" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonIcon, IonTitle, IonContent, IonSpinner } from '@ionic/vue'
import { studentsApi } from '@/api/students.api'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const student = ref(null)

const avatarInitials = computed(() => {
  if (!student.value?.full_name) return '?'
  return student.value.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

const heroThemeClass = computed(() => 'theme-blue')

function formatDate(dateString) {
  if (!dateString) return 'Belum diisi'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch(e) {
    return 'Format Salah'
  }
}

async function fetchDetails() {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const { data } = await studentsApi.getById(id)
    student.value = data.data || data
  } catch (err) {
    console.error('Failed to fetch student details', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetails)
</script>

<style scoped>
.student-detail-page {
  --background: #f8fafc;
}

.modern-toolbar {
  --background: linear-gradient(135deg, var(--color-primary, #3B82F6) 0%, #1E40AF 100%);
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

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
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
  transition: background 0.5s ease;
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
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.avatar-text {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.student-name {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}

.student-nis {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px;
}

.badge-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.gender-badge, .status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.4);
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

.parent-item {
  border-left: 3px solid #e2e8f0;
  padding-left: 12px;
  margin-bottom: 16px;
}
.parent-item:last-child {
  margin-bottom: 0;
}

/* Animations */
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
