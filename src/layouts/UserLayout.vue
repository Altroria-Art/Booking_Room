<!-- src/layouts/UserLayout.vue -->
<script setup lang="ts">
import MainNavbar from '@/components/user/MainNavbar.vue'
import HeroSection from '@/components/user/HeroSection.vue'
</script>

<template>
  <div class="layout user">
    <MainNavbar />
    <HeroSection />
    <router-view />
  </div>
</template>
