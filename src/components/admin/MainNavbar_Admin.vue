<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

function logout() {
  auth.clear()
  router.replace({ name: 'login' })
}
const activeName = computed(() => route.name)
</script>

<template>
  <header class="nav">
    <div class="nav-wrap">
      <!-- Brand -->
      <router-link to="/admin" class="brand">
        <span class="brand-main">Admin</span>
        <span class="brand-accent">• Booking Room</span>
      </router-link>

      <!-- Links -->
      <nav class="nav-links">
        <router-link
          v-for="m in menu" :key="m.key"
          :to="m.to"
          class="link"
          :class="{ 'router-link-active': activeName===m.to.name }"
        >
          {{ m.name }}
        </router-link>
      </nav>

      <!-- Right -->
      <div class="nav-right">
        <template v-if="auth.isLoggedIn">
          <span class="who">
            <strong>{{ auth.displayName }}</strong>
            <span v-if="auth.studentId" class="muted"> ({{ auth.studentId }})</span>
            <span class="badge admin">ADMIN</span>
          </span>

          
          <button class="btn" @click="logout">ออกจากระบบ</button>
        </template>
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
.brand-accent{ font-weight:900; color:#5865f2; font-size:22px; line-height:1; } /* ให้ขนาดเข้ากับคำว่า Admin */
.nav-links{ display:inline-flex; align-items:center; gap:22px; }
.link{ position:relative; font-size:14px; color:#334155; text-decoration:none; padding:4px 0; }
.link:hover{ color:#111827; }
.link.router-link-active{ color:#111827; font-weight:600; }

.nav-right{ display:inline-flex; align-items:center; gap:12px; }
.who{ font-size:13px; color:#334155; }
.who .muted{ opacity:.7; }
.badge{ font-size:11px; padding:2px 8px; border-radius:999px; margin-left:6px; text-decoration:none; }
.badge.admin{ background:#eef2ff; color:#3730a3; }

.btn{ font-size:13px; padding:6px 12px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; cursor:pointer; }
.btn:hover{ background:#f9fafb; }

@media (max-width:720px){
  .brand-main{ font-size:18px; }
  .brand-accent{ font-size:18px; }
  .nav-links{ gap:14px; }
}
</style>
