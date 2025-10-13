<template>
  <div>
    <MainNavbar />
    <HeroSectionAdmin/>
    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import HeroSectionAdmin from '@/components/admin/HeroSectionAdmin.vue';
import MainNavbar from '@/components/shared/MainNavbar.vue'
</script>
