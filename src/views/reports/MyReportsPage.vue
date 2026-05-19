<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="modern-toolbar">
        <ion-buttons slot="start">
          <div class="back-btn-wrapper">
            <ion-back-button default-href="/app/home" text=""></ion-back-button>
          </div>
        </ion-buttons>
        <ion-title class="modern-title">Riwayat Laporan</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content color="light">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Premium Page Header -->
      <div class="page-header bg-white ion-padding-horizontal ion-padding-bottom">
        <h1 class="header-title">Riwayat Anda</h1>
        <p class="header-subtitle">Pantau seluruh laporan dan poin positif yang telah Anda berikan.</p>
      </div>

      <div class="ion-padding" v-if="isLoading && reports.length === 0">
        <div v-for="i in 4" :key="i" class="skeleton-card">
          <ion-skeleton-text animated style="width: 40%; height: 14px; margin-bottom: 16px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 70%; height: 20px; margin-bottom: 8px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 50%; height: 16px; margin-bottom: 16px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 100%; height: 60px;"></ion-skeleton-text>
        </div>
      </div>

      <div class="ion-padding" v-else-if="!isLoading && reports.length === 0">
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <ion-icon :icon="documentTextOutline" class="empty-icon"></ion-icon>
          </div>
          <h3>Belum Ada Riwayat</h3>
          <p>Anda belum mengirimkan laporan pelanggaran atau poin positif apapun.</p>
        </div>
      </div>

      <div class="ion-padding reports-list" v-else>
        <SubmittedReportCard 
          v-for="item in reports" 
          :key="item.id + item._reportType" 
          :report="item" 
          @click="openDetail(item)"
        />
        
        <div class="ion-text-center ion-margin-top ion-padding-bottom" v-if="canLoadMore">
          <ion-button shape="round" color="light" class="load-more-btn" @click="loadMore" :disabled="isLoading">
            {{ isLoading ? 'Memuat...' : 'Muat Lebih Banyak' }}
          </ion-button>
        </div>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button class="custom-fab" @click="$router.push('/app/reports/new')">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
  IonContent, IonRefresher, IonRefresherContent,
  IonSkeletonText, IonIcon, IonButton, IonFab, IonFabButton,
  onIonViewWillEnter
} from '@ionic/vue'
import { documentTextOutline, addOutline } from 'ionicons/icons'
import { mobileReportsApi } from '@/api/mobileReports.api'
import SubmittedReportCard from '@/components/reports/SubmittedReportCard.vue'

const router = useRouter()

const reports = ref([])
const isLoading = ref(false)
const page = ref(1)
const canLoadMore = ref(false)

const loadData = async (reset = false) => {
  if (reset) {
    page.value = 1
    reports.value = []
  }
  
  isLoading.value = true
  try {
    const [resV, resP] = await Promise.all([
      mobileReportsApi.getMyViolations(page.value, 15),
      mobileReportsApi.getMyPositivePoints(page.value, 15)
    ])
    
    let mixed = []
    
    if (resV.data?.data) {
      mixed.push(...resV.data.data.map(i => ({ ...i, _reportType: 'violation' })))
    }
    if (resP.data?.data) {
      mixed.push(...resP.data.data.map(i => ({ ...i, _reportType: 'positive' })))
    }
    
    // Sort array by created_at or date descending
    mixed.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date).getTime()
      const dateB = new Date(b.created_at || b.date).getTime()
      return dateB - dateA
    })
    
    if (reset) {
      reports.value = mixed
    } else {
      reports.value = [...reports.value, ...mixed]
    }
    
    // simple load more logic since both endpoints might have different total pages
    const hasMoreV = (resV.data?.meta?.pages || 1) > page.value
    const hasMoreP = (resP.data?.meta?.pages || 1) > page.value
    canLoadMore.value = hasMoreV || hasMoreP

  } catch (error) {
    console.error('Failed fetching reports', error)
  } finally {
    isLoading.value = false
  }
}

const handleRefresh = async (event) => {
  await loadData(true)
  event.target.complete()
}

const loadMore = () => {
  if (canLoadMore.value) {
    page.value++
    loadData(false)
  }
}

const openDetail = (item) => {
  router.push(`/app/reports/${item._reportType}/${item.id}`)
}

onIonViewWillEnter(() => {
  loadData(true)
})
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

.page-header {
  padding-top: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.header-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
  margin: 0 0 4px 0;
}

.header-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.skeleton-card {
  background: white;
  padding: 18px;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon {
  font-size: 40px;
  color: #9ca3af;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #111827;
  font-weight: 700;
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  max-width: 250px;
}

.reports-list {
  padding-top: 16px;
  padding-bottom: 80px; /* Space for FAB */
}

.load-more-btn {
  --border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.2px;
}

.custom-fab {
  --background: #3b82f6;
  --background-activated: #2563eb;
  --box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  --border-radius: 50%;
  border-radius: 50%;
  transition: transform 0.2s;
}

.custom-fab:active {
  transform: scale(0.95);
}
</style>
