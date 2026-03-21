<template>
  <ion-page class="students-page">
    <ion-content :fullscreen="true">
      <div class="safe-top-pad" />

      <AppPageHeader title="Data Siswa" subtitle="Semua siswa terdaftar" />

      <AppSearchBar
        v-model="searchQuery"
        placeholder="Cari nama, NIS, atau kelas..."
        @search="onSearch"
      />

      <!-- Skeleton loading -->
      <div v-if="loading" class="list-container">
        <AppSkeletonCard v-for="i in 5" :key="i" />
      </div>

      <!-- Empty state -->
      <AppEmptyState
        v-else-if="!loading && filteredStudents.length === 0"
        icon="people-outline"
        title="Tidak ada siswa"
        description="Belum ada data siswa yang ditemukan dengan kriteria pencarian ini."
      />

      <!-- Student list -->
      <div v-else class="list-container">
        <AppListCard
          v-for="student in filteredStudents"
          :key="student.id"
          :title="student.full_name"
          :subtitle="`NIS: ${student.nis || '-'} • ${student.class_name || 'Belum ada kelas'}`"
          :meta="student.gender === 'MALE' ? '♂ Laki-laki' : '♀ Perempuan'"
          :avatar="student.full_name"
          @click="() => {}"
        />
      </div>

      <div style="height: 80px;" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { studentsApi } from '@/api/students.api'
import AppPageHeader from '@/components/common/AppPageHeader.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import AppSkeletonCard from '@/components/common/AppSkeletonCard.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppListCard from '@/components/common/AppListCard.vue'

const loading = ref(true)
const students = ref([])
const searchQuery = ref('')

const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return students.value
  const q = searchQuery.value.toLowerCase()
  return students.value.filter(s =>
    s.full_name?.toLowerCase().includes(q) ||
    s.nis?.toLowerCase().includes(q)
  )
})

function onSearch(query) {
  searchQuery.value = query
}

async function fetchStudents() {
  loading.value = true
  try {
    const { data } = await studentsApi.getList({ limit: 50 })
    students.value = data.data?.rows || data.data || []
  } catch {
    students.value = DEMO_STUDENTS
  } finally {
    loading.value = false
  }
}

// Demo fallback data
const DEMO_STUDENTS = [
  { id: 1, full_name: 'Ahmad Fauzi', nis: '2024001', gender: 'MALE', class_name: 'XII IPA 1' },
  { id: 2, full_name: 'Siti Rahayu', nis: '2024002', gender: 'FEMALE', class_name: 'XI IPS 2' },
  { id: 3, full_name: 'Budi Santoso', nis: '2024003', gender: 'MALE', class_name: 'X TKJ 1' },
  { id: 4, full_name: 'Dewi Lestari', nis: '2024004', gender: 'FEMALE', class_name: 'XII IPA 2' },
  { id: 5, full_name: 'Rizky Pratama', nis: '2024005', gender: 'MALE', class_name: 'XI IPA 1' },
  { id: 6, full_name: 'Nurul Hidayah', nis: '2024006', gender: 'FEMALE', class_name: 'X IPS 1' }
]

onMounted(fetchStudents)
</script>

<style scoped>
.safe-top-pad { height: calc(var(--safe-area-top) + 12px); }

.list-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
}
</style>
