<template>
  <ion-page class="profile-page">
    <ion-content :fullscreen="true">
      <div class="profile-safe-top" />

      <!-- Header -->
      <AppPageHeader title="Profil Saya" />

      <!-- Profile hero -->
      <div class="profile-hero">
        <div class="profile-hero__avatar">
          <span class="profile-hero__initials">{{ initials }}</span>
        </div>
        <h2 class="profile-hero__name">{{ authStore.userName }}</h2>
        <span class="profile-hero__role">{{ primaryRoleLabel }}</span>
      </div>

      <!-- Info list -->
      <div class="profile-section">
        <AppSectionTitle title="Informasi Akun" icon="information-circle-outline" />
        <div class="profile-info-list">
          <div v-for="info in accountInfo" :key="info.label" class="profile-info-item">
            <div class="profile-info-item__icon-wrap">
              <ion-icon :name="info.icon" />
            </div>
            <div class="profile-info-item__body">
              <span class="profile-info-item__label">{{ info.label }}</span>
              <span class="profile-info-item__value">{{ info.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Roles section -->
      <div class="profile-section">
        <AppSectionTitle title="Role & Akses" icon="shield-checkmark-outline" />
        <div class="profile-roles">
          <span
            v-for="role in authStore.roles"
            :key="role"
            class="role-chip"
          >
            {{ ROLE_LABELS[role] || role }}
          </span>
        </div>
      </div>

      <!-- Logout -->
      <div class="profile-section profile-section--logout">
        <button class="logout-btn" @click="showConfirm = true">
          <ion-icon name="log-out-outline" />
          <span>Keluar dari Akun</span>
        </button>
      </div>

      <div style="height: 80px;" />
    </ion-content>

    <AppConfirmDialog
      :is-open="showConfirm"
      title="Keluar dari Aplikasi"
      message="Apakah Anda yakin ingin keluar dari akun ini?"
      confirm-label="Ya, Keluar"
      cancel-label="Batal"
      @confirm="handleLogout"
      @cancel="showConfirm = false"
    />
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { useAuthStore } from '@/store/auth.store'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSectionTitle from '@/components/common/AppSectionTitle.vue'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const showConfirm = ref(false)

const ROLE_LABELS = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  GURU: 'Guru',
  SISWA: 'Siswa',
  ORTU: 'Orang Tua'
}

const initials = computed(() => {
  return authStore.userName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?'
})

const primaryRoleLabel = computed(() => {
  const role = authStore.roles?.[0] || ''
  return ROLE_LABELS[role] || role || 'Pengguna'
})

const accountInfo = computed(() => [
  {
    label: 'Nama Lengkap',
    value: authStore.user?.name || '-',
    icon: 'person-outline'
  },
  {
    label: 'Email',
    value: authStore.user?.email || '-',
    icon: 'mail-outline'
  },
  {
    label: 'Status Akun',
    value: authStore.user?.is_active ? 'Aktif' : 'Tidak Aktif',
    icon: 'checkmark-circle-outline'
  },
  {
    label: 'Login Terakhir',
    value: authStore.user?.last_login
      ? new Date(authStore.user.last_login).toLocaleString('id-ID', {
          dateStyle: 'medium', timeStyle: 'short'
        })
      : '-',
    icon: 'time-outline'
  }
])

async function handleLogout() {
  showConfirm.value = false
  await authStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.profile-safe-top {
  height: calc(var(--safe-area-top) + 12px);
}

/* Hero section */
.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg) var(--space-md);
  gap: var(--space-sm);
}

.profile-hero__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
}

.profile-hero__initials {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: #ffffff;
  letter-spacing: 1px;
}

.profile-hero__name {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.profile-hero__role {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  padding: 4px 14px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

/* Sections */
.profile-section {
  margin-bottom: var(--space-sm);
}

.profile-info-list {
  margin: 0 var(--space-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.profile-info-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 14px var(--space-md);
  border-bottom: 1px solid var(--color-divider);
}

.profile-info-item:last-child {
  border-bottom: none;
}

.profile-info-item__icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  background: var(--color-primary-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-info-item__icon-wrap ion-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.profile-info-item__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.profile-info-item__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.profile-info-item__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* Roles */
.profile-roles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
}

.role-chip {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  border: 1px solid rgba(37, 99, 235, 0.2);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Logout */
.profile-section--logout {
  padding: var(--space-md);
  margin-top: var(--space-sm);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 14px;
  background: var(--color-danger-subtle);
  border: 1.5px solid #FECACA;
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.logout-btn:active {
  transform: scale(0.98);
  background: #FEE2E2;
}

.logout-btn ion-icon {
  font-size: 20px;
}
</style>
