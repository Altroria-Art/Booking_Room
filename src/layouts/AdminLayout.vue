<!-- src/layouts/AdminLayout.vue -->
<template>
  <div>
    <MainNavbar_Admin homeTo="/admin" />
    <!-- แสดง Hero ของแอดมินตลอด เพื่อกันอาการหายบนบาง route -->
    <HeroSectionAdmin />
    <main class="p-6 admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import HeroSectionAdmin from '@/components/admin/HeroSectionAdmin.vue'
import MainNavbar_Admin from '@/components/admin/MainNavbar_Admin.vue'
</script>

<style scoped>
/* ให้ main อยู่เลเยอร์ต่ำกว่า hero เสมอ และอย่าล้ำขึ้นมาทับ */
.admin-main {
  position: relative;
  z-index: 1;
  margin-top: 0 !important;
}
</style>
