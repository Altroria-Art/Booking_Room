<!-- src/components/admin/MainNavbar_Admin.vue -->
<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.clear()
  router.replace({ name: 'login' })
}
</script>

<template>
  <header class="nav">
    <div class="nav-wrap">
      <!-- โลโก้: คลิกแล้วไปหน้า /admin/rooms -->
      <router-link :to="{ name: 'admin.rooms' }" class="brand" aria-label="Go to Admin rooms">
        <span class="brand-main">Admin</span>
        <span class="brand-dot">•</span>
        <span class="brand-accent">Booking Room</span>
      </router-link>

      <!-- ✅ ลบเมนูกลางออกแล้ว -->

      <!-- ด้านขวา -->
      <div class="nav-right" v-if="auth.isLoggedIn">
        <span class="badge admin">ADMIN</span>
        <button class="btn" @click="logout">ออกจากระบบ</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ใช้กฏเดียวกับ User เพื่อให้หน้าตาตรงกัน */
.nav { background:#fff; margin:0; width:100%; box-shadow:0 6px 18px rgba(0,0,0,.05); }
.nav-wrap{ display:flex; align-items:center; justify-content:space-between; padding:18px 22px; gap:16px; max-width:1120px; margin:0 auto; }

.brand{ display:inline-flex; gap:8px; text-decoration:none; align-items:baseline; letter-spacing:.5px; }
.brand-main{ font-weight:800; color:#1f2d3d; font-size:22px; }
.brand-dot{ color:#94a3b8; user-select:none; }
.brand-accent{ font-weight:900; color:#5865f2; font-size:22px; line-height:1; }

.nav-right{ display:inline-flex; align-items:center; gap:12px; }
.badge{ font-size:11px; padding:2px 8px; border-radius:999px; margin-left:6px; text-decoration:none; }
.badge.admin{ background:#eef2ff; color:#3730a3; }

.btn{ font-size:13px; padding:6px 12px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; cursor:pointer; }
.btn:hover{ background:#f9fafb; }

@media (max-width:720px){
  .brand-main{ font-size:18px; }
  .brand-accent{ font-size:18px; }
}
</style>
