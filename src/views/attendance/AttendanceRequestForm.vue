<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/attendance/requests" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Buat Pengajuan</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding bg-gray-50">
      <div class="safe-bottom">
        
      <div class="header-section">
        <p class="header-subtitle">Lengkapi data di bawah untuk pengajuan absensi.</p>
      </div>

        <form @submit.prevent="submitForm" class="form-container">
          
          <!-- Card 1: Informasi Dasar -->
          <div class="form-card">
            <h3 class="form-card__title">
              <ion-icon name="information-circle-outline"></ion-icon>
              Informasi Dasar
            </h3>

            <div class="form-group">
              <label class="form-label">Tanggal Presensi</label>
              <input 
                type="date" 
                v-model="form.attendance_date" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Tipe Pengajuan</label>
              <div class="select-wrapper">
                <select 
                  v-model="form.request_type" 
                  required
                  class="form-input form-select"
                >
                  <option value="" disabled>Pilih Tipe</option>
                  <option value="FORGOT_CLOCK_IN">Lupa Clock In</option>
                  <option value="FORGOT_CLOCK_OUT">Lupa Clock Out</option>
                  <option value="MISSED_BOTH">Lupa Absen Keduanya</option>
                  <option value="LOCATION_EXCEPTION">Kendala Lokasi / Error GPS</option>
                  <option value="TIME_CORRECTION">Koreksi Waktu</option>
                </select>
                <ion-icon name="chevron-down-outline" class="select-icon"></ion-icon>
              </div>
            </div>
          </div>

          <!-- Card 2: Detail Waktu (Conditional) -->
          <div v-if="needsClockInTime || needsClockOutTime" class="form-card form-card--highlight">
            <h3 class="form-card__title text-primary">
              <ion-icon name="time-outline"></ion-icon>
              Detail Waktu
            </h3>

            <div v-if="needsClockInTime" class="form-group conditional-group">
              <label class="form-label text-primary">Waktu Clock In Seharusnya</label>
              <input 
                type="datetime-local" 
                v-model="form.requested_clock_in_at" 
                required
                class="form-input"
              />
              <input 
                type="text" 
                v-model="form.requested_clock_in_note"
                placeholder="Catatan tambahan (opsional)"
                class="form-input form-input--muted mt-2"
              />
            </div>

            <div v-if="needsClockOutTime" class="form-group conditional-group">
              <label class="form-label text-danger">Waktu Clock Out Seharusnya</label>
              <input 
                type="datetime-local" 
                v-model="form.requested_clock_out_at" 
                required
                class="form-input input-danger"
              />
              <input 
                type="text" 
                v-model="form.requested_clock_out_note"
                placeholder="Catatan tambahan (opsional)"
                class="form-input form-input--muted mt-2"
              />
            </div>
          </div>

          <!-- Card 3: Alasan Pengajuan -->
          <div class="form-card">
            <h3 class="form-card__title">
              <ion-icon name="document-text-outline"></ion-icon>
              Alasan Pengajuan
            </h3>
            <div class="form-group">
              <textarea 
                v-model="form.reason" 
                required
                rows="4"
                placeholder="Jelaskan secara detail alasan pengajuan ini..."
                class="form-input form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="loading"
            class="submit-btn"
            :class="{ 'submit-btn--loading': loading }"
          >
            <ion-spinner v-if="loading" name="crescent" color="light" class="spinner-sm" />
            <span v-else>Kirim Pengajuan</span>
          </button>

        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonSpinner, IonIcon, toastController } from '@ionic/vue'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import attendanceService from '@/services/api/attendance.service'

const router = useRouter()

const loading = ref(false)

const todayStr = new Date().toISOString().slice(0, 10)

const form = ref({
  attendance_date: todayStr,
  request_type: '',
  requested_clock_in_at: '',
  requested_clock_out_at: '',
  requested_clock_in_note: '',
  requested_clock_out_note: '',
  reason: ''
})

const needsClockInTime = computed(() => {
  return ['FORGOT_CLOCK_IN', 'MISSED_BOTH', 'TIME_CORRECTION'].includes(form.value.request_type)
})

const needsClockOutTime = computed(() => {
  return ['FORGOT_CLOCK_OUT', 'MISSED_BOTH', 'TIME_CORRECTION'].includes(form.value.request_type)
})

const showToast = async (msg, color = 'success') => {
  const t = await toastController.create({
    message: msg,
    duration: 3000,
    color,
    position: 'top',
    cssClass: 'custom-toast'
  })
  return t.present()
}

const submitForm = async () => {
  loading.value = true
  try {
    const payload = { ...form.value }
    
    // Clean up unnecessary fields based on type
    if (!needsClockInTime.value) {
      delete payload.requested_clock_in_at
      delete payload.requested_clock_in_note
    }
    if (!needsClockOutTime.value) {
      delete payload.requested_clock_out_at
      delete payload.requested_clock_out_note
    }

    await attendanceService.createRequest(payload)
    await showToast('Pengajuan absensi berhasil dikirim.')
    router.replace('/app/attendance/requests')
  } catch (err) {
    console.error(err)
    showToast(err.response?.data?.message || 'Gagal mengirim pengajuan.', 'danger')
  } finally {
    loading.value = false
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

.header-section {
  padding: 16px 16px 0;
  margin-bottom: 20px;
}

.header-subtitle {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 0;
}

.bg-gray-50 {
  --background: var(--color-background);
}

.safe-bottom {
  padding-bottom: calc(30px + var(--ion-safe-area-bottom, 0));
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl); /* Increased gap between cards */
}

/* Card Styling */
.form-card {
  background: var(--color-surface);
  border-radius: 20px; /* softer, less kaku */
  padding: 24px; /* more breathing room inside card */
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); /* softer, wider shadow */
  display: flex;
  flex-direction: column;
  gap: var(--space-lg); /* more space between inputs */
}

.form-card--highlight {
  background: var(--color-primary-subtle);
  border-color: rgba(var(--ion-color-primary-rgb), 0.08);
  box-shadow: 0 4px 20px rgba(var(--ion-color-primary-rgb), 0.04);
}

.form-card__title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin: 0 0 4px 0;
  font-size: var(--font-size-md);
  font-weight: 800; /* Bolder for contrast */
  color: var(--color-text-primary);
}

.form-card__title ion-icon {
  font-size: 22px;
  color: var(--color-primary);
}

/* Form Group & Input styling */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Slightly more space between label and input */
}

.form-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--color-text-secondary);
  padding-left: 4px;
}

.form-input {
  width: 100%;
  background: #f8fafc; /* Softer gray background for inputs */
  border: 1px solid transparent;
  border-radius: 16px; /* softer input corners */
  padding: 16px 20px; /* more padding inside input */
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  outline: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.form-input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 4px rgba(var(--ion-color-primary-rgb), 0.1);
}

.form-input--muted {
  font-weight: var(--font-weight-medium);
  padding: 10px 14px;
}

.form-textarea {
  resize: none;
  line-height: 1.5;
  font-weight: var(--font-weight-medium);
}

/* Custom Select */
.select-wrapper {
  position: relative;
  width: 100%;
}

.form-select {
  appearance: none;
  padding-right: 40px;
}

.select-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

/* Danger / Conditional Inputs */
.input-danger:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(var(--ion-color-danger-rgb), 0.1);
}

.conditional-group {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px dashed rgba(var(--ion-color-primary-rgb), 0.2);
}

.conditional-group:first-of-type {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-primary);
  color: white;
  padding: 16px;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  border: none;
  box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: var(--space-sm);
}

.submit-btn:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.2);
}

.submit-btn--loading {
  opacity: 0.8;
  pointer-events: none;
}

.spinner-sm {
  width: 24px;
  height: 24px;
}
</style>
