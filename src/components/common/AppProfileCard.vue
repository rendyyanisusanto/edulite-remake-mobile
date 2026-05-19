<template>
  <div class="profile-card">
    <div class="profile-card__bg" />
    <div class="profile-card__content">
      <div class="profile-card__avatar">
        <div class="avatar-circle">
          <img v-if="photo" :src="photo" class="avatar-img" :alt="name" />
          <span v-else class="avatar-initials">{{ initials }}</span>
        </div>
      </div>
      <div class="profile-card__info">
        <p class="profile-card__greeting">{{ greeting }} 👋</p>
        <h2 class="profile-card__name">{{ name }}</h2>
        <div class="profile-card__meta">
          <span class="profile-card__role">{{ role }}</span>
          <span v-if="school" class="profile-card__dot">•</span>
          <span v-if="school" class="profile-card__school">{{ school }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: 'Pengguna' },
  role: { type: String, default: 'Guru' },
  school: { type: String, default: 'EDULITE School' },
  photo: { type: String, default: null },
  lastLogin: { type: String, default: null }
})

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})
</script>

<style scoped>
.profile-card {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-primary);
  margin: var(--space-md);
}

.profile-card__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1E40AF 100%);
  z-index: 0;
}

/* Decorative circles */
.profile-card__bg::before,
.profile-card__bg::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}
.profile-card__bg::before {
  width: 160px;
  height: 160px;
  top: -40px;
  right: -40px;
}
.profile-card__bg::after {
  width: 100px;
  height: 100px;
  bottom: -30px;
  left: -20px;
}

.profile-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-md);
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #ffffff;
  letter-spacing: 1px;
}

.profile-card__info {
  flex: 1;
  min-width: 0;
}

.profile-card__greeting {
  margin: 0 0 2px;
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.75);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.02em;
}

.profile-card__name {
  margin: 0 0 6px;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.profile-card__role {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.18);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.profile-card__dot {
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
}

.profile-card__school {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
