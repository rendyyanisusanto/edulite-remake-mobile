<template>
  <ion-page class="form-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/permission-letters" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">{{ isEdit ? 'Edit Surat Izin' : 'Buat Surat Izin' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="header-section">
        <p class="header-subtitle">{{ isEdit ? 'Ubah informasi surat izin draft' : 'Isi formulir untuk kegiatan siswa di luar kelas' }}</p>
      </div>

      <div class="form-container">
        <form @submit.prevent="submitForm">
          
          <!-- Card 1: Detail Kegiatan -->
          <div class="form-card animate-slide-up">
            <h3 class="form-card__title">
              <ion-icon name="information-circle-outline"></ion-icon>
              Detail Kegiatan
            </h3>

            <div class="form-group">
              <label class="form-label">Nama Kegiatan <span class="required">*</span></label>
              <div class="input-wrapper">
                <ion-input 
                  v-model="form.activity_name"
                  placeholder="Contoh: Lomba LKS Nasional"
                  class="custom-input"
                />
              </div>
              <span class="error-text" v-if="errors.activity_name">{{ errors.activity_name }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Peserta (Siswa) <span class="required">*</span></label>
              <MobileStudentPicker v-model="form.students" />
              <span class="error-text" v-if="errors.students">{{ errors.students }}</span>
            </div>
          </div>

          <!-- Card 2: Waktu Pelaksanaan -->
          <div class="form-card animate-slide-up" style="animation-delay: 0.1s">
            <h3 class="form-card__title">
              <ion-icon name="time-outline"></ion-icon>
              Waktu Pelaksanaan
            </h3>

            <!-- Date Range -->
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Tanggal Mulai <span class="required">*</span></label>
                <div class="input-wrapper">
                  <input type="date" v-model="form.start_date" class="native-date-input" />
                </div>
                <span class="error-text" v-if="errors.start_date">{{ errors.start_date }}</span>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Tanggal Selesai <span class="required">*</span></label>
                <div class="input-wrapper">
                  <input type="date" v-model="form.end_date" class="native-date-input" />
                </div>
                <span class="error-text" v-if="errors.end_date">{{ errors.end_date }}</span>
              </div>
            </div>

            <!-- Time Range -->
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Jam Mulai <span class="required">*</span></label>
                <div class="input-wrapper">
                  <input type="time" v-model="form.start_time" class="native-date-input" />
                </div>
                <span class="error-text" v-if="errors.start_time">{{ errors.start_time }}</span>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">Jam Selesai <span class="required">*</span></label>
                <div class="input-wrapper">
                  <input type="time" v-model="form.end_time" class="native-date-input" />
                </div>
                <span class="error-text" v-if="errors.end_time">{{ errors.end_time }}</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Lokasi & Pendamping -->
          <div class="form-card animate-slide-up" style="animation-delay: 0.2s">
            <h3 class="form-card__title">
              <ion-icon name="location-outline"></ion-icon>
              Lokasi & Pendamping
            </h3>

            <div class="form-group">
              <label class="form-label">Lokasi <span class="required">*</span></label>
              <div class="input-wrapper">
                <ion-input 
                  v-model="form.location"
                  placeholder="Contoh: Jakarta Pusat"
                  class="custom-input"
                />
              </div>
              <span class="error-text" v-if="errors.location">{{ errors.location }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Nama Pendamping & Jabatan</label>
              <div class="input-wrapper">
                <ion-input 
                  v-model="form.companion_name"
                  placeholder="Contoh: Budi Santoso (Guru OR)"
                  class="custom-input"
                />
              </div>
              <p class="help-text">Otomatis terisi dengan nama Anda jika dikosongkan.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Catatan / Keterangan</label>
              <div class="input-wrapper">
                <ion-textarea 
                  v-model="form.notes"
                  placeholder="Catatan tambahan bila diperlukan..."
                  class="custom-textarea"
                  :rows="3"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="submit-section animate-slide-up" style="animation-delay: 0.3s">
            <ion-button 
              expand="block" 
              class="premium-btn" 
              :disabled="isSubmitting"
              type="submit"
            >
              <ion-spinner v-if="isSubmitting" name="crescent" slot="start" />
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Surat Izin' }}
            </ion-button>
          </div>

        </form>
      </div>

      <div style="height: 60px;" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonTitle, IonContent, IonInput, IonTextarea, IonSpinner } from '@ionic/vue'
import { permissionLettersApi } from '@/api/permission-letters.api'
import { useAuthStore } from '@/store/auth.store'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import MobileStudentPicker from '@/components/common/MobileStudentPicker.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isEdit = ref(false)
const isSubmitting = ref(false)
const letterId = ref(route.params.id)

const form = ref({
  activity_name: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  location: '',
  companion_name: '',
  notes: '',
  students: [] // Array of selected student objects payload requirement
})

const errors = ref({})

onMounted(async () => {
  if (route.path.includes('edit') && letterId.value) {
    isEdit.value = true
    await loadData()
  } else {
    // PRE-FILL for NEW letters
    const d = new Date()
    const pad = (v) => String(v).padStart(2, '0')
    
    // Today
    const todayStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    form.value.start_date = todayStr
    
    // Tomorrow
    const tom = new Date()
    tom.setDate(d.getDate() + 1)
    const tomStr = `${tom.getFullYear()}-${pad(tom.getMonth() + 1)}-${pad(tom.getDate())}`
    form.value.end_date = tomStr
    
    // Current Time
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`
    form.value.start_time = timeStr
    form.value.end_time = timeStr

    // Default companion name
    if (authStore.userName) {
      form.value.companion_name = authStore.userName
    }
  }
})

async function loadData() {
  try {
    const { data } = await permissionLettersApi.getById(letterId.value)
    const item = data.data || data
    form.value = {
      activity_name: item.activity_name,
      start_date: item.start_date,
      end_date: item.end_date,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location,
      companion_name: item.companion_name,
      notes: item.notes,
      students: item.students?.map(s => ({ id: s.student_id, full_name: s.student?.full_name, nis: s.student?.nis })) || []
    }
  } catch(e) {
    console.error('Failed to load letter:', e)
  }
}

function validate() {
  errors.value = {}
  let valid = true

  if (!form.value.activity_name) { errors.value.activity_name = 'Kegiatan wajib diisi'; valid = false }
  if (!form.value.start_date) { errors.value.start_date = 'Wajib diisi'; valid = false }
  if (!form.value.end_date) { errors.value.end_date = 'Wajib diisi'; valid = false }
  if (!form.value.start_time) { errors.value.start_time = 'Wajib diisi'; valid = false }
  if (!form.value.end_time) { errors.value.end_time = 'Wajib diisi'; valid = false }
  if (!form.value.location) { errors.value.location = 'Lokasi wajib diisi'; valid = false }
  if (form.value.students.length === 0) { errors.value.students = 'Minimal 1 siswa dipilih'; valid = false }

  if (form.value.start_date && form.value.end_date) {
    if (new Date(form.value.end_date) < new Date(form.value.start_date)) {
      errors.value.end_date = 'Tidak boleh sebelum tanggal mulai'
      valid = false
    }
  }

  return valid
}

async function submitForm() {
  if (!validate()) return

  isSubmitting.value = true
  try {
    const payload = {
      ...form.value,
      students: form.value.students.map(s => ({ student_id: s.id }))
      // Payload securely ignores providing code, purpose, or teacher_id, logic handles in backend
    }

    if (isEdit.value) {
      await permissionLettersApi.update(letterId.value, payload)
      router.replace(`/app/permission-letters/${letterId.value}`)
    } else {
      const { data } = await permissionLettersApi.create(payload)
      const newId = data.data?.id
      router.replace(newId ? `/app/permission-letters/${newId}` : '/app/permission-letters')
    }
  } catch (err) {
    console.error('Submit error:', err)
    // Here we can pop an ionic toast in real apps
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.form-page {
  --background: var(--color-background);
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

.header-section {
  padding: 16px 16px 0;
  margin-bottom: 12px;
}

.header-subtitle {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 0;
}

.form-container {
  padding: 0 16px 24px;
}

.form-container form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card Styling */
.form-card {
  background: var(--color-surface);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-card__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.form-card__title ion-icon {
  font-size: 22px;
  color: var(--color-primary);
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-left: 4px;
}

.required {
  color: #ef4444;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-left: 4px;
  margin-top: 2px;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin: 2px 0 0 4px;
}

.input-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.custom-input, .custom-textarea {
  --padding-start: 14px;
  --padding-end: 14px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.native-date-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 14px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 500;
  color: var(--color-text-primary);
  outline: none;
}

.submit-section {
  margin-top: 24px;
}

.premium-btn {
  --background: var(--color-primary);
  --border-radius: 14px;
  --padding-top: 18px;
  --padding-bottom: 18px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.25);
}
</style>
