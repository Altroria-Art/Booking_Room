<script setup lang="ts">
import { ref } from 'vue'
import MainNavbar from '@/components/user/MainNavbar.vue'
import HeroSection from '@/components/user/HeroSection.vue'
import ReviewRoom from '@/components/user/ReviewRoom.vue'
import BookingModal from '@/components/user/BookingModal.vue' // 👈 นำเข้าด้วย

// 👇 สร้างตัวแปร state สำหรับเปิด/ปิดโมดัล
const showBooking = ref(false)
</script>

<template>
  <div>
    <MainNavbar />
    <HeroSection />
    <ReviewRoom />
    <router-view />
  </div>

  <div>
    <button @click="showBooking = true">ยืนยันการจอง</button>
    <BookingModal v-model:open="showBooking" />
  </div>
</template>

