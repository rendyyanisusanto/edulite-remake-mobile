<template>
  <ion-page class="positive-page">
    <ion-content :fullscreen="true">
      <div class="safe-top-pad" />

      <AppPageHeader title="Perilaku Positif" subtitle="Catatan perilaku positif siswa" />

      <!-- Skeleton -->
      <div v-if="loading" class="list-container">
        <AppSkeletonCard v-for="i in 4" :key="i" />
      </div>

      <!-- Empty -->
      <AppEmptyState
        v-else-if="!loading && records.length === 0"
        icon="star-outline"
        title="Belum ada catatan positif"
        description="Belum ada catatan perilaku positif siswa yang tersedia."
      />

      <!-- List -->
      <div v-else class="list-container">
        <div v-for="item in records" :key="item.id" class="positive-card">
          <div class="positive-card__header">
            <div class="positive-card__avatar">
              <span>{{ getInitials(item.student_name) }}</span>
            </div>
            <div class="positive-card__info">
              <span class="positive-card__name">{{ item.student_name }}</span>
              <span class="positive-card__type">{{ item.type_name }}</span>
            </div>
            <div class="positive-card__points">
              <span class="points-badge">+{{ item.points }}</span>
            </div>
          </div>
          <div class="positive-card__footer">
            <div class="positive-card__meta">
              <ion-icon name="location-outline" />
              <span>{{ item.location || 'Sekolah' }}</span>
            </div>
            <div class="positive-card__meta">
              <ion-icon name="calendar-outline" />
              <span>{{ formatDate(item.date) }}</span>
            </div>
            <AppStatusBadge :status="item.status" :label="STATUS_LABELS[item.status] || item.status" />
          </div>
        </div>
      </div>

      <div style="height: 100px;" />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="fab-create">
      <ion-fab-button>
        <ion-icon name="add-outline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon, IonFab, IonFabButton } from '@ionic/vue'
import { positiveApi } from '@/api/positive.api'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'

const loading = ref(true)
const records = ref([])

const STATUS_LABELS = {
  verified: 'Terverifikasi',
  unverified: 'Belum Terverifikasi',
  approved: 'Disetujui',
  pending: 'Menunggu'
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

async function fetchRecords() {
  loading.value = true
  try {
    const { data } = await positiveApi.getStudentPoints({ limit: 30 })
    records.value = data.data?.rows || data.data || []
  } catch {
    records.value = DEMO_DATA
  } finally {
    loading.value = false
  }
}

const DEMO_DATA = [
  { id: 1, student_name: 'Siti Rahayu', type_name: 'Membantu Teman', points: 10, status: 'verified', date: '2026-03-18', location: 'Kelas' },
  { id: 2, student_name: 'Dewi Lestari', type_name: 'Aktif Pramuka', points: 15, status: 'approved', date: '2026-03-15', location: 'Lapangan' },
  { id: 3, student_name: 'Ahmad Fauzi', type_name: 'Juara Kelas', points: 20, status: 'verified', date: '2026-03-10', location: 'Sekolah' },
  { id: 4, student_name: 'Nurul Hidayah', type_name: 'Aktif OSIS', points: 12, status: 'unverified', date: '2026-03-08', location: 'Aula' }
]

onMounted(fetchRecords)
</script>

<style scoped>
.safe-top-pad { height: calc(var(--safe-area-top) + 12px); }

.list-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
}

.positive-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--space-md);
  box-shadow: var(--shadow-xs);
  border-left: 4px solid var(--color-success);
}

.positive-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.positive-card__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
  flex-shrink: 0;
}

.positive-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.positive-card__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.positive-card__type {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.points-badge {
  background: var(--color-success-subtle);
  color: var(--color-success);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.positive-card__footer {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  border-top: 1px solid var(--color-divider);
  padding-top: var(--space-sm);
  flex-wrap: wrap;
}

.positive-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.positive-card__meta ion-icon {
  font-size: 13px;
}

.fab-create { --ion-safe-area-bottom: 70px; }
</style>
