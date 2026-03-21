<template>
  <ion-page class="violations-page">
    <ion-content :fullscreen="true">
      <div class="safe-top-pad" />

      <AppPageHeader title="Pelanggaran" subtitle="Catatan pelanggaran siswa">
        <template #actions>
          <ion-button fill="clear" @click="showInfo = true">
            <ion-icon slot="icon-only" name="filter-outline" />
          </ion-button>
        </template>
      </AppPageHeader>

      <!-- Filter chips -->
      <div class="filter-chips">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="list-container">
        <AppSkeletonCard v-for="i in 4" :key="i" />
      </div>

      <!-- Empty state -->
      <AppEmptyState
        v-else-if="!loading && filteredViolations.length === 0"
        icon="shield-checkmark-outline"
        title="Tidak ada pelanggaran"
        :description="activeFilter === 'all'
          ? 'Belum ada catatan pelanggaran siswa.'
          : `Tidak ada pelanggaran dengan status ${activeFilter}.`"
      />

      <!-- List -->
      <div v-else class="list-container">
        <div
          v-for="item in filteredViolations"
          :key="item.id"
          class="violation-card"
        >
          <div class="violation-card__header">
            <div class="violation-card__student-avatar">
              <span>{{ getInitials(item.student_name) }}</span>
            </div>
            <div class="violation-card__header-info">
              <span class="violation-card__student">{{ item.student_name }}</span>
              <span class="violation-card__type">{{ item.violation_type }}</span>
            </div>
            <AppStatusBadge :status="item.status" :label="STATUS_LABELS[item.status] || item.status" />
          </div>
          <div class="violation-card__body">
            <div class="violation-card__meta">
              <ion-icon name="calendar-outline" />
              <span>{{ formatDate(item.date) }}</span>
            </div>
            <div class="violation-card__meta">
              <ion-icon name="alert-circle-outline" />
              <span class="violation-card__points">{{ item.point }} poin</span>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 100px;" />
    </ion-content>

    <!-- FAB button -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="fab-create">
      <ion-fab-button>
        <ion-icon name="add-outline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent, IonButton, IonIcon, IonFab, IonFabButton } from '@ionic/vue'
import { violationsApi } from '@/api/violations.api'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'

const loading = ref(true)
const violations = ref([])
const activeFilter = ref('all')
const showInfo = ref(false)

const STATUS_LABELS = {
  open: 'Terbuka',
  resolved: 'Selesai',
  pending: 'Proses',
  approved: 'Disetujui'
}

const filters = [
  { label: 'Semua', value: 'all' },
  { label: 'Terbuka', value: 'open' },
  { label: 'Proses', value: 'pending' },
  { label: 'Selesai', value: 'resolved' }
]

const filteredViolations = computed(() => {
  if (activeFilter.value === 'all') return violations.value
  return violations.value.filter(v => v.status === activeFilter.value)
})

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

async function fetchViolations() {
  loading.value = true
  try {
    const { data } = await violationsApi.getStudentViolations({ limit: 30 })
    violations.value = data.data?.rows || data.data || []
  } catch {
    violations.value = DEMO_VIOLATIONS
  } finally {
    loading.value = false
  }
}

const DEMO_VIOLATIONS = [
  { id: 1, student_name: 'Ahmad Fauzi', violation_type: 'Terlambat Masuk Kelas', status: 'open', date: '2026-03-18', point: 5 },
  { id: 2, student_name: 'Budi Santoso', violation_type: 'Tidak Memakai Seragam', status: 'resolved', date: '2026-03-15', point: 10 },
  { id: 3, student_name: 'Siti Rahayu', violation_type: 'Membolos', status: 'pending', date: '2026-03-10', point: 20 },
  { id: 4, student_name: 'Rizky Pratama', violation_type: 'Berkelahi', status: 'open', date: '2026-03-12', point: 30 }
]

onMounted(fetchViolations)
</script>

<style scoped>
.safe-top-pad { height: calc(var(--safe-area-top) + 12px); }

.filter-chips {
  display: flex;
  gap: var(--space-xs);
  padding: 0 var(--space-md) var(--space-md);
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-chip {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
  box-shadow: var(--shadow-primary);
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
}

/* Violation card */
.violation-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  box-shadow: var(--shadow-xs);
}

.violation-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.violation-card__student-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-danger);
  flex-shrink: 0;
}

.violation-card__header-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.violation-card__student {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.violation-card__type {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.violation-card__body {
  display: flex;
  gap: var(--space-md);
  border-top: 1px solid var(--color-divider);
  padding-top: var(--space-sm);
}

.violation-card__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.violation-card__meta ion-icon {
  font-size: 14px;
}

.violation-card__points {
  color: var(--color-danger);
  font-weight: var(--font-weight-semibold);
}

.fab-create {
  --ion-safe-area-bottom: 70px;
}
</style>
