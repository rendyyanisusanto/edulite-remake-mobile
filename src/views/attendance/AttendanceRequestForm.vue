<template>
  <ion-page>
    <AppPageHeader title="Buat Pengajuan" :showBack="true" />

    <ion-content :fullscreen="true" class="bg-gray-50">
      <div class="p-4 safe-bottom">
        <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          
          <form @submit.prevent="submitForm" class="flex flex-col gap-4">
            
            <!-- Attendance Date -->
            <div class="form-group">
              <label class="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Tanggal Presensi</label>
              <input 
                type="date" 
                v-model="form.attendance_date" 
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-primary/20 outline-none transition-shadow"
              />
            </div>

            <!-- Request Type -->
            <div class="form-group">
              <label class="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Tipe Pengajuan</label>
              <select 
                v-model="form.request_type" 
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-primary/20 outline-none transition-shadow appearance-none"
              >
                <option value="" disabled>Pilih Tipe</option>
                <option value="FORGOT_CLOCK_IN">Lupa Clock In</option>
                <option value="FORGOT_CLOCK_OUT">Lupa Clock Out</option>
                <option value="MISSED_BOTH">Lupa Absen Keduanya</option>
                <option value="LOCATION_EXCEPTION">Kendala Lokasi / Error GPS</option>
                <option value="TIME_CORRECTION">Koreksi Waktu</option>
              </select>
            </div>

            <!-- Conditional Time Inputs based on Type -->
            <div v-if="needsClockInTime" class="form-group border-l-2 border-primary pl-3 bg-primary/5 p-3 rounded-r-xl">
              <label class="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">Waktu Clock In</label>
              <input 
                type="datetime-local" 
                v-model="form.requested_clock_in_at" 
                required
                class="w-full bg-white border border-primary/20 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-primary/30 outline-none"
              />
              <input 
                v-if="needsClockInTime"
                type="text" 
                v-model="form.requested_clock_in_note"
                placeholder="Catatan tambahan (opsional)"
                class="w-full mt-2 bg-white border border-primary/20 rounded-lg px-4 py-2 text-sm text-gray-800 outline-none"
              />
            </div>

            <div v-if="needsClockOutTime" class="form-group border-l-2 border-danger pl-3 bg-danger/5 p-3 rounded-r-xl">
              <label class="block text-xs font-bold text-danger mb-1.5 uppercase tracking-wide">Waktu Clock Out</label>
              <input 
                type="datetime-local" 
                v-model="form.requested_clock_out_at" 
                required
                class="w-full bg-white border border-danger/20 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-danger/30 outline-none"
              />
              <input 
                v-if="needsClockOutTime"
                type="text" 
                v-model="form.requested_clock_out_note"
                placeholder="Catatan tambahan (opsional)"
                class="w-full mt-2 bg-white border border-danger/20 rounded-lg px-4 py-2 text-sm text-gray-800 outline-none"
              />
            </div>

            <!-- Reason -->
            <div class="form-group mt-2">
              <label class="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Alasan Detail</label>
              <textarea 
                v-model="form.reason" 
                required
                rows="4"
                placeholder="Jelaskan secara detail alasan pengajuan ini..."
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-shadow"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="loading"
              class="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold font-lg shadow-md transition-transform"
              :class="loading ? 'opacity-70 pointer-events-none' : 'active:scale-95'"
            >
              <ion-spinner v-if="loading" name="crescent" color="light" class="w-5 h-5" />
              <span v-else>Kirim Pengajuan</span>
            </button>

          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonSpinner, toastController } from '@ionic/vue'
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
    position: 'top'
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
.bg-gray-50 {
  --background: #f9fafb;
}
.safe-bottom {
  padding-bottom: calc(20px + var(--ion-safe-area-bottom, 0));
}
</style>
