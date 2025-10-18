<!-- src/layouts/AdminLayout.vue -->
<template>
  <div>
    <MainNavbar_Admin homeTo="/admin" />
    <HeroSectionAdmin v-if="showHero" />
    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeroSectionAdmin from '@/components/admin/HeroSectionAdmin.vue'
import MainNavbar_Admin from '@/components/admin/MainNavbar_Admin.vue'

const route = useRoute()
// แสดง Hero หาก meta.showAdminHero ไม่ได้ถูกตั้งเป็น false (ค่า default = true)
const showHero = computed(() => route.meta?.showAdminHero !== false)
</script>
