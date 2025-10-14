<template>
  <div>
    <MainNavbar_Admin />
    <HeroSectionAdmin />
    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import HeroSectionAdmin from '@/components/admin/HeroSectionAdmin.vue';
import MainNavbar_Admin from '@/components/admin/MainNavbar_Admin.vue';
</script>
