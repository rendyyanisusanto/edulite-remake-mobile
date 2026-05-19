<template>
  <ion-page class="progress-form-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button :default-href="`/app/extracurricular/${extracurricularId}/students/${studentId}/progress`" text="" />
          </div>
        </ion-buttons>
        <ion-title class="modern-title">{{ isEdit ? 'Edit Perkembangan' : 'Tambah Perkembangan' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="page-header">
        <h1 class="header-title">{{ studentName }}</h1>
        <p class="header-subtitle">{{ extracurricularName }}</p>
      </div>

      <div v-if="loading" class="form-container">
        <AppSkeletonCard v-for="i in 4" :key="i" />
      </div>

      <AppEmptyState
        v-else-if="hasError"
        icon="alert-circle-outline"
        title="Gagal memuat form"
        :description="errorMessage"
        action-label="Coba Lagi"
        @action="load"
      />

      <div v-else class="form-container">
        <form @submit.prevent="submitForm">
          <div class="form-card">
            <h3 class="card-title">Informasi Utama</h3>

            <div class="field-group">
              <label class="field-label">Ekskul</label>
              <input class="native-input disabled-input" :value="extracurricularName" type="text" readonly />
            </div>

            <div class="field-group">
              <label class="field-label">Siswa</label>
              <input class="native-input disabled-input" :value="studentName" type="text" readonly />
            </div>

            <div class="field-group">
              <label class="field-label">Aspek Perkembangan <span class="required">*</span></label>
              <ion-select
                v-model="form.aspect_id"
                interface="action-sheet"
                class="field-select"
                placeholder="Pilih aspek"
                cancel-text="Batal"
              >
                <ion-select-option v-for="aspect in aspects" :key="aspect.id" :value="aspect.id">
                  {{ aspect.name }}
                </ion-select-option>
              </ion-select>
              <p v-if="errors.aspect_id" class="error-text">{{ errors.aspect_id }}</p>
            </div>

            <div class="field-group">
              <label class="field-label">Tanggal Perkembangan <span class="required">*</span></label>
              <input v-model="form.progress_date" class="native-input" type="date" />
              <p v-if="errors.progress_date" class="error-text">{{ errors.progress_date }}</p>
            </div>

            <div class="field-group">
              <label class="field-label">Session (Opsional)</label>
              <ion-select
                v-model="form.session_id"
                interface="action-sheet"
                class="field-select"
                placeholder="Pilih sesi"
                cancel-text="Batal"
              >
                <ion-select-option :value="null">Tanpa sesi</ion-select-option>
                <ion-select-option v-for="session in sessions" :key="session.id" :value="session.id">
                  {{ formatSessionLabel(session) }}
                </ion-select-option>
              </ion-select>
            </div>
          </div>

          <div class="form-card">
            <h3 class="card-title">Detail Penilaian</h3>

            <div class="field-group">
              <label class="field-label">Score (Opsional)</label>
              <input v-model="form.score" class="native-input" inputmode="decimal" placeholder="Contoh: 88.5" />
            </div>

            <div class="field-group">
              <label class="field-label">Predikat (Opsional)</label>
              <input v-model="form.predicate" class="native-input" placeholder="Contoh: A / Baik" />
            </div>

            <div class="field-group">
              <label class="field-label">Level (Opsional)</label>
              <input v-model="form.level" class="native-input" placeholder="Contoh: Lanjutan" />
            </div>

            <div class="field-group">
              <label class="field-label">Catatan (Opsional)</label>
              <ion-textarea v-model="form.note" class="native-textarea" :rows="3" placeholder="Catatan perkembangan siswa" />
            </div>

            <div class="field-group">
              <label class="field-label">Rekomendasi (Opsional)</label>
              <ion-textarea v-model="form.recommendation" class="native-textarea" :rows="3" placeholder="Saran tindak lanjut" />
            </div>
          </div>

          <div class="action-wrap">
            <ion-button expand="block" class="submit-btn" type="submit" :disabled="submitting">
              <ion-spinner v-if="submitting" name="crescent" slot="start" />
              {{ submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Perkembangan') }}
            </ion-button>
          </div>
        </form>
      </div>

      <div class="bottom-spacer" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonSpinner,
  toastController
} from '@ionic/vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import { extracurricularApi } from '@/api/extracurricular.api'
import { useExtracurricularProgress } from '@/composables/useExtracurricularProgress'

const route = useRoute()
const router = useRouter()

const extracurricularId = route.params.id
const studentId = route.params.studentId
const progressId = route.params.progressId || null
const isEdit = !!progressId

const loading = ref(false)
const submitting = ref(false)
const hasError = ref(false)
const errorMessage = ref('Terjadi kesalahan saat memuat form.')
const extracurricularName = ref('Ekskul')
const studentName = ref('Siswa')
const academicYearId = ref(null)
const aspects = ref([])
const sessions = ref([])
const errors = ref({})

const form = ref({
  aspect_id: '',
  progress_date: new Date().toISOString().slice(0, 10),
  session_id: null,
  score: '',
  predicate: '',
  level: '',
  note: '',
  recommendation: ''
})

const { parseError, getProgressAspects, getStudentProgress, createStudentProgress, updateStudentProgress } = useExtracurricularProgress()

function formatSessionLabel(session) {
  const date = session?.session_date ? new Date(session.session_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'
  return `${date} · ${session?.session_title || session?.extracurricular?.name || 'Sesi'}`
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null
  if (typeof value === 'string' && value.trim() === '') return null
  return value
}

function normalizeScore(value) {
  if (value === undefined || value === null || value === '') return null
  const normalized = String(value).replace(',', '.').trim()
  const numberValue = Number(normalized)
  return Number.isNaN(numberValue) ? null : numberValue
}

function validate() {
  const nextErrors = {}

  if (!extracurricularId) nextErrors.extracurricular_id = 'Ekskul wajib dipilih'
  if (!studentId) nextErrors.student_id = 'Siswa wajib dipilih'
  if (!form.value.aspect_id) nextErrors.aspect_id = 'Aspek perkembangan wajib dipilih'
  if (!form.value.progress_date) nextErrors.progress_date = 'Tanggal perkembangan wajib diisi'

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

async function toast(message, color = 'success') {
  const t = await toastController.create({ message, color, duration: 1700 })
  await t.present()
}

async function load() {
  loading.value = true
  hasError.value = false
  errors.value = {}
  try {
    const [detailRes, memberRes, aspectRows, sessionsRes] = await Promise.all([
      extracurricularApi.getMyExtracurricularDetail(extracurricularId),
      extracurricularApi.getExtracurricularMembers(extracurricularId, { status: 'ACTIVE', limit: 250 }),
      getProgressAspects(extracurricularId),
      extracurricularApi.getSessions({ extracurricular_id: extracurricularId, limit: 100, page: 1 })
    ])

    const detail = detailRes?.data?.data || {}
    extracurricularName.value = detail?.name || 'Ekskul'
    academicYearId.value = detail?.academic_year_id || null

    const members = memberRes?.data?.data?.items || memberRes?.data?.data || []
    const selectedMember = members.find((member) => String(member.student_id) === String(studentId))
    studentName.value = selectedMember?.student?.full_name || 'Siswa'

    aspects.value = aspectRows
    sessions.value = sessionsRes?.data?.data?.items || []

    if (isEdit) {
      const progressRows = await getStudentProgress({ extracurricular_id: extracurricularId, student_id: studentId })
      const current = progressRows.find((row) => String(row.id) === String(progressId))
      if (!current) throw new Error('Data perkembangan yang akan diedit tidak ditemukan')

      form.value = {
        aspect_id: current.aspect_id || '',
        progress_date: current.progress_date || '',
        session_id: current.session_id || null,
        score: current.score ?? '',
        predicate: current.predicate || '',
        level: current.level || '',
        note: current.note || '',
        recommendation: current.recommendation || ''
      }
    }
  } catch (err) {
    hasError.value = true
    errorMessage.value = parseError(err, 'Gagal memuat form perkembangan siswa')
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  if (!validate()) return
  if (!academicYearId.value) {
    errors.value = { ...errors.value, extracurricular_id: 'Tahun ajaran ekskul belum tersedia' }
    return
  }

  const payload = {
    extracurricular_id: Number(extracurricularId),
    student_id: Number(studentId),
    academic_year_id: Number(academicYearId.value),
    aspect_id: Number(form.value.aspect_id),
    progress_date: form.value.progress_date,
    session_id: normalizeNullable(form.value.session_id),
    score: normalizeScore(form.value.score),
    predicate: normalizeNullable(form.value.predicate),
    level: normalizeNullable(form.value.level),
    note: normalizeNullable(form.value.note),
    recommendation: normalizeNullable(form.value.recommendation)
  }

  submitting.value = true
  try {
    if (isEdit) {
      await updateStudentProgress(progressId, payload)
      await toast('Perkembangan berhasil diperbarui')
    } else {
      await createStudentProgress(payload)
      await toast('Perkembangan berhasil disimpan')
    }
    router.replace(`/app/extracurricular/${extracurricularId}/students/${studentId}/progress`)
  } catch (err) {
    await toast(parseError(err, 'Gagal menyimpan perkembangan siswa'), 'danger')
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.progress-form-page {
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

.page-header {
  padding: 18px 16px 4px;
}

.header-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.header-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.form-container {
  padding: 10px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-container form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

.required {
  color: #ef4444;
}

.field-select {
  width: 100%;
  --padding-start: 12px;
  --padding-end: 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

.native-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 11px 12px;
  font-size: 14px;
  outline: none;
  background: #ffffff;
}

.disabled-input {
  background: #f8fafc;
  color: #64748b;
}

.native-textarea {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 10px;
  --padding-bottom: 10px;
}

.error-text {
  margin: 0;
  color: #ef4444;
  font-size: 12px;
}

.action-wrap {
  padding-top: 4px;
}

.submit-btn {
  --background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  --border-radius: 12px;
  font-weight: 700;
}

.bottom-spacer {
  height: 84px;
}
</style>
