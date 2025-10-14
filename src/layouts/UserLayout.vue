<script setup lang="ts">
import MainNavbar from '@/components/user/MainNavbar.vue';
import HeroSection from '@/components/user/HeroSection.vue';
import ReviewRoom from '@/components/user/ReviewRoom.vue';

</script>

<template>
  <div>
    <MainNavbar />
    <HeroSection />
    <ReviewRoom />
    <router-view />
  </div>
  <div>
      <button @click="showBooking = true">ยืนยันการจอง ➕</button>
      <BookingModal v-model:open="showBooking" />
    </div>
</template>