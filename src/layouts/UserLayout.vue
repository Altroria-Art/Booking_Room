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
</template>