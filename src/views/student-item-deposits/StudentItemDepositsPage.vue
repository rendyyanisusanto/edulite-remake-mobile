<template>
  <ion-page>
    <ion-content class="ion-padding">
      <h2>Penitipan Barang</h2>
      <ion-segment v-model="tab">
        <ion-segment-button value="items"><ion-label>Barang</ion-label></ion-segment-button>
        <ion-segment-button value="loans"><ion-label>Histori</ion-label></ion-segment-button>
      </ion-segment>

      <div v-if="tab==='items'" class="mt-3">
        <ion-card v-for="item in items" :key="item.id">
          <ion-card-content>
            <div>{{ item.item_name }} - {{ item.current_status }}</div>
            <div class="text-sm text-gray-600">{{ item.student?.full_name }} • {{ item.class?.name || '-' }}</div>
            <div v-if="item.current_status==='BORROWED'" class="mt-2">
              <ion-button size="small" @click="returnDaily(item.id)">Kembalikan Manual</ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
      <div v-else class="mt-3">
        <ion-card v-for="loan in loans" :key="loan.id"><ion-card-content>{{ loan.deposit?.item_name }} - {{ loan.status }}</ion-card-content></ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { studentItemDepositApi } from '@/api/student-item-deposit.api'

const tab = ref('items')
const items = ref([])
const loans = ref([])

onMounted(async () => {
  items.value = (await studentItemDepositApi.getMyItems()).data.data.items || []
  loans.value = (await studentItemDepositApi.getMyLoans()).data.data.items || []
})

const returnDaily = async (depositId) => {
  await studentItemDepositApi.returnDaily(depositId, { return_method: 'MANUAL' })
  items.value = (await studentItemDepositApi.getActiveItems()).data.data.items || []
}
</script>
