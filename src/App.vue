<script setup>
  import MainNavbar from './components/MainNavbar.vue'
  import HeroSection from './components/HeroSection.vue'
  import { ref } from 'vue'
  import BookingModal from './components/BookingModal.vue'

  const showBooking = ref(false)
</script>

<template>
  <div>
    <MainNavbar />
    <HeroSection />
  </div>
  <div>
    <button @click="showBooking = true">ยืนยันการจอง ➕</button>
    <BookingModal v-model:open="showBooking" />
  </div>
</template>

