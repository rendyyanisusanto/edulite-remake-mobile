<template>
  <ion-page class="counseling-page">
    <ion-content :fullscreen="true">
      <div class="safe-top-pad" />

      <AppPageHeader title="Konseling" subtitle="Kasus dan sesi bimbingan konseling" />

      <!-- Tab selector -->
      <div class="tab-selector">
        <button
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'cases' }"
          @click="activeTab = 'cases'"
        >
          <ion-icon name="folder-open-outline" />
          Kasus BK
          <span v-if="cases.length" class="tab-count">{{ cases.length }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'sessions' }"
          @click="activeTab = 'sessions'"
        >
          <ion-icon name="chatbubbles-outline" />
          Sesi
          <span v-if="sessions.length" class="tab-count">{{ sessions.length }}</span>
        </button>
      </div>

      <!-- CASES TAB -->
      <div v-show="activeTab === 'cases'">
        <div v-if="loading" class="list-container">
          <AppSkeletonCard v-for="i in 3" :key="i" />
        </div>
        <AppEmptyState
          v-else-if="!loading && cases.length === 0"
          icon="folder-open-outline"
          title="Tidak ada kasus"
          description="Belum ada kasus konseling yang tercatat."
        />
        <div v-else class="list-container">
          <div v-for="item in cases" :key="item.id" class="case-card">
            <div class="case-card__top">
              <div class="case-card__level-badge" :class="`level-${item.level}`">
                {{ item.level || 'N/A' }}
              </div>
              <AppStatusBadge :status="item.status" :label="CASE_STATUS[item.status] || item.status" />
            </div>
            <h3 class="case-card__title">{{ item.issue_title }}</h3>
            <div class="case-card__meta-row">
              <div class="case-card__meta">
                <ion-icon name="person-outline" />
                <span>{{ item.student_name || 'Siswa' }}</span>
              </div>
              <div class="case-card__meta">
                <ion-icon name="layers-outline" />
                <span>{{ item.category || 'Umum' }}</span>
              </div>
              <div class="case-card__meta">
                <ion-icon name="calendar-outline" />
                <span>{{ formatDate(item.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SESSIONS TAB -->
      <div v-show="activeTab === 'sessions'">
        <div v-if="loading" class="list-container">
          <AppSkeletonCard v-for="i in 3" :key="i" />
        </div>
        <AppEmptyState
          v-else-if="!loading && sessions.length === 0"
          icon="chatbubbles-outline"
          title="Tidak ada sesi"
          description="Belum ada sesi konseling yang tercatat."
        />
        <div v-else class="list-container">
          <div v-for="session in sessions" :key="session.id" class="session-card">
            <div class="session-card__date">
              <div class="session-card__day">{{ getDay(session.session_date) }}</div>
              <div class="session-card__month">{{ getMonth(session.session_date) }}</div>
            </div>
            <div class="session-card__body">
              <span class="session-card__case">{{ session.case_title || 'Sesi Konseling' }}</span>
              <div class="session-card__meta">
                <ion-icon name="person-circle-outline" />
                <span>{{ session.counselor_name || 'Konselor' }}</span>
              </div>
              <div class="session-card__meta">
                <ion-icon name="time-outline" />
                <span>{{ session.duration ? `${session.duration} menit` : '-' }}</span>
              </div>
            </div>
            <div class="session-card__method">
              {{ session.method || 'Langsung' }}
            </div>
          </div>
        </div>
      </div>

      <div style="height: 100px;" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { counselingApi } from '@/api/counseling.api'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppStatusBadge from '@/components/common/AppStatusBadge.vue'

const activeTab = ref('cases')
const loading = ref(true)
const cases = ref([])
const sessions = ref([])

const CASE_STATUS = {
  open: 'Terbuka',
  ongoing: 'Berjalan',
  closed: 'Ditutup',
  pending: 'Menunggu'
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function getDay(d) {
  if (!d) return '--'
  return new Date(d).getDate()
}

function getMonth(d) {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('id-ID', { month: 'short' })
}

async function fetchData() {
  loading.value = true
  try {
    const [casesRes, sessionsRes] = await Promise.allSettled([
      counselingApi.getCases({ limit: 20 }),
      counselingApi.getSessions({ limit: 20 })
    ])

    if (casesRes.status === 'fulfilled') {
      cases.value = casesRes.value.data?.data?.rows || casesRes.value.data?.data || []
    } else {
      cases.value = DEMO_CASES
    }

    if (sessionsRes.status === 'fulfilled') {
      sessions.value = sessionsRes.value.data?.data?.rows || sessionsRes.value.data?.data || []
    } else {
      sessions.value = DEMO_SESSIONS
    }
  } catch {
    cases.value = DEMO_CASES
    sessions.value = DEMO_SESSIONS
  } finally {
    loading.value = false
  }
}

const DEMO_CASES = [
  { id: 1, issue_title: 'Masalah Akademik — Nilai Menurun', level: 'RINGAN', status: 'ongoing', category: 'Akademik', student_name: 'Ahmad Fauzi', created_at: '2026-03-15' },
  { id: 2, issue_title: 'Konflik dengan Teman Sebaya', level: 'SEDANG', status: 'open', category: 'Sosial', student_name: 'Budi Santoso', created_at: '2026-03-12' },
  { id: 3, issue_title: 'Masalah Keluarga', level: 'BERAT', status: 'closed', category: 'Personal', student_name: 'Siti Rahayu', created_at: '2026-03-01' }
]

const DEMO_SESSIONS = [
  { id: 1, case_title: 'Masalah Akademik', counselor_name: 'Bpk. Rahman, S.Pd', session_date: '2026-03-18', duration: 45, method: 'Tatap Muka' },
  { id: 2, case_title: 'Konflik Teman', counselor_name: 'Ibu Sari, M.Pd', session_date: '2026-03-14', duration: 60, method: 'Online' },
  { id: 3, case_title: 'Masalah Keluarga', counselor_name: 'Bpk. Rahman, S.Pd', session_date: '2026-03-05', duration: 30, method: 'Tatap Muka' }
]

onMounted(fetchData)
</script>

<style scoped>
.safe-top-pad { height: calc(var(--safe-area-top) + 12px); }

/* Tab selector */
.tab-selector {
  display: flex;
  margin: 0 var(--space-md) var(--space-md);
  background: var(--color-divider);
  border-radius: var(--radius-md);
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px var(--space-sm);
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn ion-icon { font-size: 16px; }

.tab-btn--active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  font-weight: var(--font-weight-semibold);
}

.tab-count {
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
}

/* Case card */
.case-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--space-md);
  border-left: 4px solid var(--color-info);
}

.case-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.case-card__level-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.level-RINGAN { background: #ECFDF5; color: #10B981; }
.level-SEDANG { background: #FFFBEB; color: #F59E0B; }
.level-BERAT { background: #FEF2F2; color: #EF4444; }

.case-card__title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.case-card__meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.case-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.case-card__meta ion-icon { font-size: 13px; }

/* Session card */
.session-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.session-card__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  background: var(--color-primary-subtle);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-xs);
}

.session-card__day {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: 1;
}

.session-card__month {
  font-size: 10px;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.session-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.session-card__case {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-card__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.session-card__meta ion-icon { font-size: 13px; }

.session-card__method {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  background: var(--color-primary-subtle);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}
</style>
