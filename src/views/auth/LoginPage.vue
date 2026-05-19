<template>
  <ion-page class="login-page">
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">

        <!-- Top branding -->
        <div class="login-brand">
          <div class="login-brand__logo" :class="{ 'login-brand__logo--image': appStore.schoolLogo }">
            <img v-if="appStore.schoolLogo" :src="appStore.schoolLogo" class="login-brand__img" :alt="appStore.schoolName" />
            <ion-icon v-else name="school-outline" class="login-brand__icon" />
          </div>
          <h1 class="login-brand__name">{{ appStore.schoolShortName }}</h1>
          <p class="login-brand__tagline">Sistem Informasi Sekolah</p>
        </div>

        <!-- Login card -->
        <div class="login-card">
          <div class="login-card__header">
            <h2 class="login-card__title">Selamat Datang</h2>
            <p class="login-card__subtitle">Masuk untuk melanjutkan</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <!-- Email field -->
            <div class="form-group">
              <label class="form-label">Email</label>
              <div class="input-wrap" :class="{ 'input-wrap--error': errors.email }">
                <ion-icon name="mail-outline" class="input-icon" />
                <input
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="nama@sekolah.sch.id"
                  autocomplete="email"
                  inputmode="email"
                  @blur="validateEmail"
                />
              </div>
              <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
            </div>

            <!-- Password field -->
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrap" :class="{ 'input-wrap--error': errors.password }">
                <ion-icon name="lock-closed-outline" class="input-icon" />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Masukkan password"
                  autocomplete="current-password"
                  @blur="validatePassword"
                />
                <button
                  type="button"
                  class="input-toggle"
                  @click="showPassword = !showPassword"
                >
                  <ion-icon :name="showPassword ? 'eye-off-outline' : 'eye-outline'" />
                </button>
              </div>
              <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
            </div>

            <!-- API Error -->
            <div v-if="authStore.error" class="login-alert">
              <ion-icon name="alert-circle-outline" />
              <span>{{ authStore.error }}</span>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="login-btn"
              :class="{ 'login-btn--loading': authStore.loading }"
              :disabled="authStore.loading"
            >
              <ion-spinner v-if="authStore.loading" name="crescent" class="login-btn__spinner" />
              <span v-else>Masuk</span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <p class="login-footer">
          Edulite v1.0 &copy; {{ currentYear }}
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue'
import { useAuthStore } from '@/store/auth.store'
import { useAppStore } from '@/store/app.store'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const form = ref({ email: '', password: '' })
const showPassword = ref(false)
const errors = ref({ email: '', password: '' })

const currentYear = computed(() => new Date().getFullYear())

function validateEmail() {
  if (!form.value.email) {
    errors.value.email = 'Email wajib diisi'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Format email tidak valid'
  } else {
    errors.value.email = ''
  }
}

function validatePassword() {
  if (!form.value.password) {
    errors.value.password = 'Password wajib diisi'
  } else if (form.value.password.length < 4) {
    errors.value.password = 'Password minimal 4 karakter'
  } else {
    errors.value.password = ''
  }
}

async function handleLogin() {
  validateEmail()
  validatePassword()
  if (errors.value.email || errors.value.password) return

  const result = await authStore.login({
    email: form.value.email,
    password: form.value.password
  })

  if (result?.success) {
    router.replace('/app/home')
  }
}
</script>

<style scoped>
.login-page {
  --background: var(--color-background);
}

.login-content {
  --background: linear-gradient(160deg, #EFF6FF 0%, #F8FAFC 50%, #F0FDF4 100%);
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--space-xl) var(--space-lg);
  padding-top: calc(var(--safe-area-top) + var(--space-xl));
}

/* Brand section */
.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-xl);
  gap: var(--space-xs);
}

.login-brand__logo {
  width: 76px;
  height: 76px;
  border-radius: var(--radius-xl);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
  margin-bottom: var(--space-sm);
  overflow: hidden;
}

.login-brand__logo--image {
  background: #ffffff;
  border: 1px solid var(--color-border);
}

.login-brand__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.login-brand__icon {
  font-size: 38px;
  color: #ffffff;
}

.login-brand__name {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

.login-brand__tagline {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Login card */
.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
}

.login-card__header {
  margin-bottom: var(--space-lg);
}

.login-card__title {
  margin: 0 0 4px;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.login-card__subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-background);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input-wrap:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  background: var(--color-surface);
}

.input-wrap--error {
  border-color: var(--color-danger);
  background: var(--color-danger-subtle);
}

.input-icon {
  font-size: 18px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  padding: 13px 0;
  min-width: 0;
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.input-toggle {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--color-text-tertiary);
}

.input-toggle ion-icon {
  font-size: 18px;
}

.form-error {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

/* API Error alert */
.login-alert {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--color-danger-subtle);
  border: 1px solid #FECACA;
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

/* Submit button */
.login-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #ffffff;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: var(--shadow-primary);
  margin-top: var(--space-xs);
}

.login-btn:active:not(:disabled) {
  transform: scale(0.98);
  background: var(--color-primary-dark);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-btn__spinner {
  width: 20px;
  height: 20px;
  --color: #ffffff;
}

/* Footer */
.login-footer {
  margin-top: var(--space-xl);
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-align: center;
}
</style>
