<script setup>
import { ref } from 'vue'
import DaySchedule from '../components/DaySchedule.vue'

// คืนค่าวันนี้แบบ YYYY-MM-DD เอาไว้ส่งให้ backend
function todayYMD() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// คืนค่าวันนี้แบบ DD/MM/YYYY เอาไว้แสดงบนหน้าเว็บ
function todayDMY() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

const today = ref(todayYMD())
const todayDisplay = ref(todayDMY())
</script>

<template>
  <section style="padding:20px">
    <h2 style="margin:0 0 12px">
      ตารางการจอง ({{ todayDisplay }})
    </h2>

    <DaySchedule :date="today" />
  </section>
</template>
