<script setup>
import MainNavbar from './components/shared/MainNavbar.vue'
import HeroSection from './components/user/HeroSection.vue'
import BookingModal from './components/BookingModal.vue'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ReviewRoom from './components/user/ReviewRoom.vue';

const showBooking = ref(false)

const route = useRoute()
const showHero = computed(() => ['/', '/review', '/history'].includes(route.path))
</script>

<template>
  <router-view />
  <!-- <div>
    <MainNavbar />
    <HeroSection v-if="showHero" />
    <router-view />
    <div>
      <button @click="showBooking = true">ยืนยันการจอง ➕</button>
      <BookingModal v-model:open="showBooking" />
    </div>
    <ReviewRoom />
  </div> -->
</template>
