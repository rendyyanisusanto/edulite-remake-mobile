<template>
  <div class="student-selector">
    <ion-item @click="openModal" detail button class="selector-field">
      <ion-icon :icon="personOutline" slot="start" color="medium"></ion-icon>
      <ion-label>
        <h3 v-if="selectedStudent">{{ selectedStudent.full_name }}</h3>
        <p v-if="selectedStudent">NIS: {{ selectedStudent.nis }}</p>
        <span v-else class="placeholder-text">Pilih Siswa...</span>
      </ion-label>
    </ion-item>

    <ion-modal :is-open="isOpen" @didDismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Pilih Siswa</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Tutup</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="search-container">
          <ion-searchbar 
            v-model="searchQuery" 
            placeholder="Cari nama atau NIS..." 
            mode="ios"
            search-icon="search"
            class="custom-search"
          ></ion-searchbar>
        </div>
        <div v-if="isSearching" class="ion-padding ion-text-center">
          <ion-spinner></ion-spinner>
          <p>Mencari siswa...</p>
        </div>
        <ion-list v-else-if="students.length > 0">
          <ion-item v-for="stu in students" :key="stu.id" button @click="selectStudent(stu)">
            <ion-avatar slot="start">
              <div class="avatar-placeholder">{{ stu.full_name.charAt(0).toUpperCase() }}</div>
            </ion-avatar>
            <ion-label>
              <h2>{{ stu.full_name }}</h2>
              <p>NIS: {{ stu.nis || '-' }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
        <div v-else class="ion-padding ion-text-center text-muted">
          Siswa tidak ditemukan.
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  IonItem, IonLabel, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonButton, IonContent, IonSearchbar, IonList, IonAvatar, IonSpinner
} from '@ionic/vue'
import { personOutline } from 'ionicons/icons'
import { useStudentSelector } from '@/composables/useStudentSelector'

const props = defineProps({
  modelValue: { type: Number, default: null } // Returns student_id
})

const emit = defineEmits(['update:modelValue', 'change'])

const { isSearching, students, searchQuery, searchStudents } = useStudentSelector()

const isOpen = ref(false)
const selectedStudent = ref(null)

const openModal = () => {
  isOpen.value = true
  if (students.value.length === 0) {
    searchStudents()
  }
}

const closeModal = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const selectStudent = (stu) => {
  selectedStudent.value = stu
  emit('update:modelValue', stu.id)
  emit('change', stu)
  closeModal()
}

// Reset when model changes from outside (e.g. form cleared)
// This is a simple implementation assuming when modelValue goes to null we clear
import { watch } from 'vue'
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    selectedStudent.value = null
  }
})
</script>

<style scoped>
.placeholder-text {
  color: #9ca3af;
  font-size: 15px;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  border-radius: 50%;
}
.text-muted {
  color: #9ca3af;
  margin-top: 2rem;
}
.selector-field {
  --background: transparent;
  width: 100%;
}
.search-container {
  padding: 12px;
  background-color: var(--ion-color-step-50, #f9fafb);
  border-bottom: 1px solid var(--ion-color-step-150, #e5e7eb);
}
.custom-search {
  --background: #fff;
  --box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  --border-radius: 8px;
  padding: 0;
}
</style>
