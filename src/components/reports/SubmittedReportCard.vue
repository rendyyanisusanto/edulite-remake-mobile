<template>
  <div class="premium-card" @click="emit('click')">
    <div class="accent-line" :class="report._reportType"></div>
    
    <div class="card-header">
      <div class="type-badge" :class="report._reportType">
        <ion-icon :icon="report._reportType === 'violation' ? alertCircleOutline : starOutline"></ion-icon>
        <span>{{ report._reportType === 'violation' ? 'Catatan Pelanggaran' : 'Poin Positif' }}</span>
      </div>
      <ReportStatusBadge :status="report.status" />
    </div>

    <div class="card-body">
      <h3 class="student-name">{{ report.student?.full_name || 'Siswa tidak ditemukan' }}</h3>
      <p class="student-nis">NIS: {{ report.student?.nis || '-' }}</p>
      
      <div class="report-description">
        {{ truncate(report.description, 80) }}
      </div>
    </div>

    <div class="card-footer">
      <div class="footer-info">
        <div class="info-pill">
          <ion-icon :icon="calendarOutline"></ion-icon>
          <span>{{ formatDate(report.date) }}</span>
        </div>
        <div class="info-pill photo-pill" v-if="report.photo">
          <ion-icon :icon="imageOutline"></ion-icon>
          <span>Ada Foto</span>
        </div>
      </div>
      <div class="action-arrow">
        <ion-icon :icon="chevronForwardOutline"></ion-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonIcon } from '@ionic/vue'
import { calendarOutline, imageOutline, alertCircleOutline, starOutline, chevronForwardOutline } from 'ionicons/icons'
import ReportStatusBadge from './ReportStatusBadge.vue'

defineProps({
  report: { type: Object, required: true }
})

const emit = defineEmits(['click'])

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.premium-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  padding: 18px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.premium-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  background-color: #fcfcfc;
}

.accent-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
}

.accent-line.violation {
  background: linear-gradient(180deg, #f43f5e 0%, #fda4af 100%);
}

.accent-line.positive {
  background: linear-gradient(180deg, #10b981 0%, #6ee7b7 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-badge.violation {
  color: #e11d48;
}

.type-badge.positive {
  color: #059669;
}

.type-badge ion-icon {
  font-size: 14px;
}

.card-body {
  margin-bottom: 16px;
}

.student-name {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
}

.student-nis {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  font-family: monospace;
}

.report-description {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
  padding-left: 10px;
  border-left: 2px solid #e5e7eb;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px dashed #e5e7eb;
}

.footer-info {
  display: flex;
  gap: 12px;
}

.info-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.info-pill ion-icon {
  font-size: 15px;
  color: #9ca3af;
}

.photo-pill {
  color: #3b82f6;
}

.photo-pill ion-icon {
  color: #3b82f6;
}

.action-arrow ion-icon {
  font-size: 18px;
  color: #d1d5db;
  transition: color 0.2s;
}

.premium-card:active .action-arrow ion-icon {
  color: #9ca3af;
}
</style>
