<template>
  <ion-page class="extracurricular-detail-page">
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/extracurricular" text="" />
          </div>
        </ion-buttons>
        <ion-title class="modern-title">{{ detail?.name || 'Detail Ekskul' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-icon="chevron-down-circle-outline" refreshing-spinner="crescent" />
      </ion-refresher>

      <div class="page-header">
        <p class="header-subtitle">{{ detail?.code || '-' }} · {{ detail?.type || 'EKSKUL' }}</p>
      </div>

      <div v-if="loading" class="section-container">
        <AppSkeletonCard v-for="i in 3" :key="i" />
      </div>
      <AppEmptyState
        v-else-if="hasError"
        icon="alert-circle-outline"
        title="Gagal memuat detail ekskul"
        :description="errorMessage"
        action-label="Coba Lagi"
        @action="load"
      />

      <template v-else>
        <div class="section-container">
          <div class="summary-card">
            <div class="summary-item">
              <span class="summary-label">Lokasi</span>
              <span class="summary-value">{{ detail?.location || '-' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Pelaksanaan</span>
              <span class="summary-value">{{ detail?.implementation_type || '-' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Tahun Ajaran</span>
              <span class="summary-value">{{ detail?.academic_year?.name || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="section-container">
          <h3 class="section-title">Jadwal</h3>
          <AppEmptyState
            v-if="schedules.length === 0"
            icon="calendar-outline"
            title="Belum ada jadwal"
            description="Jadwal ekskul belum ditambahkan."
          />
          <AppListCard
            v-for="schedule in schedules"
            v-else
            :key="schedule.id"
            :title="schedule.title || schedule.day_of_week || 'Jadwal Ekskul'"
            :subtitle="`${schedule.day_of_week || '-'} · ${schedule.start_time || '-'} - ${schedule.end_time || '-'}`"
            icon="calendar-outline"
            :show-arrow="false"
          />
        </div>

        <div class="section-container">
          <ion-segment v-model="activeTab" class="detail-segment">
            <ion-segment-button value="members">
              <ion-label>Anggota</ion-label>
            </ion-segment-button>
            <ion-segment-button value="progress">
              <ion-label>Perkembangan</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <div v-if="activeTab === 'members'" class="section-container">
          <h3 class="section-title">Anggota Aktif</h3>
          <p class="section-caption">Pilih siswa untuk melihat riwayat perkembangan.</p>
          <AppEmptyState
            v-if="members.length === 0"
            icon="people-outline"
            title="Belum ada anggota aktif"
            description="Data anggota aktif belum tersedia."
          />
          <AppListCard
            v-for="member in members.slice(0, 6)"
            v-else
            :key="member.id"
            :title="member.student?.full_name || '-'"
            :subtitle="member.student?.nis ? `NIS ${member.student.nis}` : 'NIS -'"
            :meta="member.status || 'ACTIVE'"
            :avatar="member.student?.full_name || 'Siswa'"
            accent="#10b981"
            @click="openStudentProgress(member.student_id)"
          />
          <ion-button
            v-if="members.length > 0"
            fill="outline"
            expand="block"
            class="action-btn"
            @click="openMembers"
          >
            Lihat Semua Anggota
          </ion-button>
        </div>

        <div v-else class="section-container">
          <h3 class="section-title">Perkembangan Siswa</h3>
          <p class="section-caption">Master aspek diatur admin web, pelatih mengisi progres siswa di sini.</p>
          <AppEmptyState
            v-if="aspects.length === 0"
            icon="layers-outline"
            title="Aspek perkembangan belum diatur oleh admin"
            description="Hubungi admin untuk menambahkan master aspek perkembangan ekskul."
          />
          <template v-else>
            <div class="aspect-summary">
              <p class="aspect-title">Aspek Tersedia</p>
              <div class="aspect-pills">
                <span v-for="aspect in aspects.slice(0, 6)" :key="aspect.id" class="aspect-pill">
                  {{ aspect.name }}
                </span>
              </div>
            </div>

            <AppEmptyState
              v-if="members.length === 0"
              icon="people-outline"
              title="Belum ada anggota aktif"
              description="Tambahkan anggota aktif agar pelatih bisa mengisi perkembangan."
            />
            <AppListCard
              v-for="member in members.slice(0, 6)"
              v-else
              :key="member.id"
              :title="member.student?.full_name || '-'"
              :subtitle="member.student?.nis ? `NIS ${member.student.nis}` : 'NIS -'"
              meta="Lihat Perkembangan"
              :avatar="member.student?.full_name || 'Siswa'"
              accent="#3b82f6"
              @click="openStudentProgress(member.student_id)"
            />
            <ion-button
              v-if="members.length > 0"
              fill="outline"
              expand="block"
              class="action-btn"
              @click="openMembers"
            >
              Pilih Siswa Lain
            </ion-button>
          </template>
        </div>
      </template>

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
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton
} from '@ionic/vue'
import AppListCard from '@/components/common/AppListCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import { extracurricularApi } from '@/api/extracurricular.api'

const route = useRoute()
const router = useRouter()
const extracurricularId = route.params.id

const loading = ref(false)
const hasError = ref(false)
const errorMessage = ref('Terjadi kesalahan saat memuat detail ekskul.')
const activeTab = ref('members')
const detail = ref(null)
const schedules = ref([])
const members = ref([])
const aspects = ref([])

function openMembers() {
  router.push(`/app/extracurricular/${extracurricularId}/members`)
}

function openStudentProgress(studentId) {
  router.push(`/app/extracurricular/${extracurricularId}/students/${studentId}/progress`)
}

async function load() {
  loading.value = true
  hasError.value = false
  try {
    const [detailRes, schedulesRes, membersRes, aspectsRes] = await Promise.all([
      extracurricularApi.getMyExtracurricularDetail(extracurricularId),
      extracurricularApi.getMySchedules(extracurricularId),
      extracurricularApi.getExtracurricularMembers(extracurricularId, { status: 'ACTIVE', limit: 200 }),
      extracurricularApi.getProgressAspects(extracurricularId)
    ])

    detail.value = detailRes?.data?.data || null
    schedules.value = schedulesRes?.data?.data || []
    members.value = membersRes?.data?.data?.items || membersRes?.data?.data || []
    aspects.value = aspectsRes?.data?.data || []
  } catch (err) {
    hasError.value = true
    errorMessage.value = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Gagal memuat detail ekskul'
  } finally {
    loading.value = false
  }
}

async function handleRefresh(event) {
  await load()
  event.target.complete()
}

onMounted(load)
</script>

<style scoped>
.extracurricular-detail-page {
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
  padding: 16px 16px 0;
}

.header-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-tertiary);
  font-weight: 600;
}

.section-container {
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  margin: 2px 0 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.section-caption {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.summary-label {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.summary-value {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.detail-segment {
  border: 1px solid #dbeafe;
  border-radius: 10px;
  padding: 2px;
  background: #eff6ff;
}

.action-btn {
  --border-color: #cbd5e1;
  --color: #334155;
  --border-radius: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.aspect-summary {
  border-radius: 12px;
  border: 1px solid #dbeafe;
  background: #f8fbff;
  padding: 10px;
}

.aspect-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #1e3a8a;
}

.aspect-pills {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.aspect-pill {
  font-size: 11px;
  font-weight: 700;
  color: #1d4ed8;
  background: #dbeafe;
  border-radius: 999px;
  padding: 4px 8px;
}

.bottom-spacer {
  height: 84px;
}
</style>
