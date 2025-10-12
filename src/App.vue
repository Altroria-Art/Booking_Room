<script setup>
  import MainNavbar from './components/MainNavbar.vue'
  import HeroSection from './components/HeroSection.vue'
  import { ref } from 'vue'
  import ReviewRoom from './components/ReviewRoom.vue';
  import BookingModal from './components/BookingModal.vue'

  const showBooking = ref(false)
</script>

<template>
  <div>
    <MainNavbar />
    <HeroSection />
    <ReviewRoom />
  </div>
  <div>
    <button @click="showBooking = true">จองห้องประชุมที่นี่ ✚</button>
    <BookingModal v-model:open="showBooking" />
  </div>
</template>

