<template>
  <div class="skeleton-card">
    <div class="skeleton-card__header">
      <div class="skeleton skeleton-card__avatar" />
      <div class="skeleton-card__header-info">
        <div class="skeleton skeleton-card__line skeleton-card__line--title" />
        <div class="skeleton skeleton-card__line skeleton-card__line--subtitle" />
      </div>
    </div>
    <div class="skeleton skeleton-card__line skeleton-card__line--body" />
    <div class="skeleton skeleton-card__line skeleton-card__line--body-short" />
  </div>
</template>

<script setup>
// No props needed — purely visual skeleton
</script>

<style scoped>
.skeleton-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.skeleton-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-card__header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skeleton-card__line {
  height: 12px;
  border-radius: var(--radius-xs);
}

.skeleton-card__line--title { width: 60%; }
.skeleton-card__line--subtitle { width: 40%; height: 10px; }
.skeleton-card__line--body { width: 100%; }
.skeleton-card__line--body-short { width: 70%; }
</style>
