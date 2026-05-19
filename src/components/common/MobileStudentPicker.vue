<template>
  <div class="student-picker-wrapper">
    
    <!-- Trigger Button -->
    <div class="picker-trigger" @click="openModal">
      <div class="trigger-label">Pilih Siswa ({{ modelValue.length }})</div>
      <ion-icon name="people-outline" class="trigger-icon" />
    </div>

    <!-- Selected Students Chips Preview -->
    <div v-if="modelValue.length > 0" class="selected-chips">
      <div v-for="student in modelValue" :key="student.id" class="chip">
        <span class="chip-label">{{ student.full_name }}</span>
        <ion-icon name="close-circle" class="chip-remove" @click.stop="removeStudent(student.id)" />
      </div>
    </div>

    <!-- Modal Picker -->
    <ion-modal :is-open="isOpen" @didDismiss="cancelSelection" class="student-picker-modal">
      <ion-header class="ion-no-border">
        <ion-toolbar class="picker-toolbar">
          <ion-buttons slot="start">
            <ion-button @click="cancelSelection" color="medium">Batal</ion-button>
          </ion-buttons>
          <ion-title class="picker-title">Pilih Siswa</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="confirmSelection" color="primary" class="confirm-btn">
              Simpan ({{ tempSelected.length }})
            </ion-button>
          </ion-buttons>
        </ion-toolbar>

        <!-- Sticky Search & Filter -->
        <div class="picker-controls">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Cari siswa..."
            class="picker-searchbar"
            @ionInput="onSearch(searchQuery)"
            @ionClear="onSearch('')"
          />
          <div class="picker-filter">
            <ion-icon name="funnel" class="filter-icon" />
            <ion-select
              v-model="selectedClass"
              interface="popover"
              placeholder="Semua Kelas"
              @ionChange="onClassChange"
              class="premium-select"
            >
              <ion-select-option value="">Semua Kelas</ion-select-option>
              <ion-select-option v-for="c in classes" :key="c.id" :value="c.id">
                {{ c.name }}
              </ion-select-option>
            </ion-select>
          </div>
        </div>
      </ion-header>

      <ion-content class="picker-content">
        <div v-if="loading && students.length === 0" class="loading-state">
          <ion-spinner name="crescent" color="primary" />
        </div>

        <div v-else-if="!loading && students.length === 0" class="empty-state">
          <ion-icon name="search-outline" />
          <p>Siswa tidak ditemukan</p>
        </div>

        <div v-else class="student-list">
          <div
            v-for="student in students"
            :key="student.id"
            class="student-item"
            :class="{ 'is-selected': isSelected(student.id) }"
            @click="toggleStudent(student)"
          >
            <div class="student-avatar">
              {{ getInitials(student.full_name) }}
            </div>
            <div class="student-info">
              <span class="student-name">{{ student.full_name }}</span>
              <span class="student-meta">
                {{ student.nis || '-' }} • {{ student.class_history?.[0]?.class_info?.name || 'Belum Kelas' }}
              </span>
            </div>
            <div class="checkbox-circle" :class="{ 'checked': isSelected(student.id) }">
              <ion-icon v-if="isSelected(student.id)" name="checkmark" />
            </div>
          </div>
        </div>

        <ion-infinite-scroll @ionInfinite="loadMore" :disabled="isLastPage">
          <ion-infinite-scroll-content loading-spinner="bubbles" />
        </ion-infinite-scroll>
      </ion-content>
    </ion-modal>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonSearchbar, IonIcon, IonSpinner, IonInfiniteScroll,
  IonInfiniteScrollContent, IonSelect, IonSelectOption
} from '@ionic/vue'
import { studentsApi } from '@/api/students.api'
import { classesApi } from '@/api/classes.api'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const tempSelected = ref([])

// Data fetching refs
const loading = ref(false)
const students = ref([])
const classes = ref([])
const searchQuery = ref('')
const selectedClass = ref('')
const page = ref(1)
const isLastPage = ref(false)

function openModal() {
  tempSelected.value = [...props.modelValue]
  isOpen.value = true
  if (classes.value.length === 0) fetchClasses()
  if (students.value.length === 0) fetchStudents(true)
}

function cancelSelection() {
  isOpen.value = false
}

function confirmSelection() {
  emit('update:modelValue', [...tempSelected.value])
  isOpen.value = false
}

function toggleStudent(student) {
  const index = tempSelected.value.findIndex(s => s.id === student.id)
  if (index >= 0) {
    tempSelected.value.splice(index, 1)
  } else {
    // Save minimal data needed
    tempSelected.value.push({ 
      id: student.id, 
      full_name: student.full_name,
      nis: student.nis
    })
  }
}

function removeStudent(studentId) {
  const newSelection = props.modelValue.filter(s => s.id !== studentId)
  emit('update:modelValue', newSelection)
}

function isSelected(studentId) {
  return tempSelected.value.some(s => s.id === studentId)
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function onSearch(query) {
  searchQuery.value = query
  fetchStudents(true)
}

function onClassChange() {
  fetchStudents(true)
}

async function fetchClasses() {
  try {
    const { data } = await classesApi.getList({ limit: 100 })
    classes.value = data.data?.classes || data.data || []
  } catch (err) {
    console.error('Failed to fetch classes:', err)
  }
}

async function fetchStudents(reset = false) {
  if (reset) {
    page.value = 1
    students.value = []
    isLastPage.value = false
    loading.value = true
  }

  try {
    const { data } = await studentsApi.getList({ 
      limit: 20,
      page: page.value,
      search: searchQuery.value,
      class_id: selectedClass.value || undefined
    })
    
    const newStudents = data.data?.students || []
    if (newStudents.length < 20) {
      isLastPage.value = true
    }
    
    const existingIds = new Set(students.value.map(s => s.id))
    const fresh = newStudents.filter(s => !existingIds.has(s.id))
    students.value = [...students.value, ...fresh]
  } catch (err) {
    console.error('Failed to fetch students:', err)
  } finally {
    loading.value = false
  }
}

async function loadMore(event) {
  if (isLastPage.value) {
    event.target.complete()
    return
  }
  page.value++
  await fetchStudents()
  event.target.complete()
}
</script>

<style scoped>
.student-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.picker-trigger {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  transition: background 0.2s;
}
.picker-trigger:active {
  background: #f8fafc;
}
.trigger-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.trigger-icon {
  font-size: 20px;
  color: var(--color-primary);
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: flex;
  align-items: center;
  background: var(--color-primary-subtle);
  padding: 6px 10px 6px 12px;
  border-radius: 16px;
  gap: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.chip-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}
.chip-remove {
  font-size: 18px;
  color: var(--color-primary);
  opacity: 0.8;
}
.chip-remove:active {
  opacity: 1;
}

/* Modal Styling */
.picker-toolbar {
  --background: #fff;
  padding: 4px 8px;
}
.picker-title {
  font-size: 16px;
  font-weight: 600;
}
.confirm-btn {
  font-weight: 600;
}

.picker-controls {
  padding: 8px 16px 12px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.picker-searchbar {
  padding: 0;
  --background: #f1f5f9;
  --border-radius: 10px;
  --box-shadow: none;
}
.picker-filter {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 2px 12px;
}
.filter-icon {
  color: var(--color-primary);
  margin-right: 8px;
  font-size: 16px;
}
.premium-select {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  --padding-start: 0;
  color: var(--color-text-primary);
}

.picker-content {
  --background: #f8fafc;
}
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-tertiary);
}
.empty-state ion-icon {
  font-size: 40px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.student-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.student-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  border: 1px solid transparent;
  transition: all 0.2s;
  gap: 12px;
}
.student-item.is-selected {
  background: #f0fdf4;
  border-color: #86efac;
}

.student-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
}

.student-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.student-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.student-meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.checkbox-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.checkbox-circle.checked {
  background: #10B981;
  border-color: #10B981;
}
.checkbox-circle ion-icon {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}
</style>
