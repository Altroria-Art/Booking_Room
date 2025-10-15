<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// ใช้ path ตรง ๆ ลดความเสี่ยงชื่อ route ไม่ตรง
const userMenu = [
  { key: 'home',  name: 'หน้าแรก', to: '/' },
  { key: 'rooms', name: 'จองห้อง', to: '/rooms' },
]
const adminMenu = [
  { key: 'dashboard', name: 'แดชบอร์ด', to: '/admin' },
  { key: 'rooms',     name: 'จัดการห้อง', to: '/admin/rooms' },
  { key: 'users',     name: 'ผู้ใช้',     to: '/admin/users' },
]

const menu = computed(() => (auth.isAdmin ? adminMenu : userMenu))
const activePath = computed(() => route.path)

function logout() {
  auth.clear()
  router.replace('/login')
}

// กันพังเวลาแอดมินกด — ถ้า route ไม่มีจะไม่พาไปและไม่ error
function goAdminSafe(path = '/admin') {
  // มีชื่อ route หรือไม่ไม่สำคัญ เพราะเราใช้ path
  router.push(path).catch(() => {})
}
</script>

<template>
  <header class="nav">
    <div class="nav-wrap">
      <!-- Brand -->
      <router-link to="/" class="brand">
        <span class="brand-main">Booking</span>
        <span class="brand-accent">Room</span>
      </router-link>

      <!-- Links -->
      <nav class="nav-links">
        <router-link
          v-for="m in menu" :key="m.key"
          :to="m.to"
          class="link"
          :class="{ 'router-link-active': activePath===m.to }"
        >
          {{ m.name }}
        </router-link>
      </nav>

      <!-- Right -->
      <div class="nav-right">
        <template v-if="auth.isLoggedIn">
          <span class="who">
            สวัสดี, <strong>{{ auth.displayName }}</strong>
            <span v-if="auth.studentId"> ({{ auth.studentId }})</span>
            <span class="badge user" v-if="!auth.isAdmin">USER</span>
            <button v-if="auth.isAdmin" class="badge admin" @click="goAdminSafe('/admin')">
              ADMIN
            </button>
          </span>
          <button class="btn" @click="logout">ออกจากระบบ</button>
        </template>
        <template v-else>
          <router-link class="btn" to="/login">เข้าสู่ระบบ</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* แถบ navbar */
.nav { background:#fff; margin:0; width:100%; box-shadow:0 6px 18px rgba(0,0,0,.05); }

/* คอนเทนต์ด้านใน */
.nav-wrap{ display:flex; align-items:center; justify-content:space-between; padding:18px 22px; gap:16px; max-width:1120px; margin:0 auto; }

/* โลโก้ */
.brand{ display:inline-flex; gap:8px; text-decoration:none; align-items:baseline; letter-spacing:.5px; }
.brand-main{ font-weight:800; color:#1f2d3d; font-size:22px; }
.brand-accent{ font-weight:900; color:#5865f2; font-size:32px; line-height:1; }

/* ลิงก์เมนูซ้ายกลาง */
.nav-links{ display:inline-flex; align-items:center; gap:22px; }
.link{ position:relative; font-size:14px; color:#334155; text-decoration:none; padding:4px 0; }
.link:hover{ color:#111827; }
.link.router-link-active{ color:#111827; font-weight:600; }

/* ด้านขวา */
.nav-right{ display:inline-flex; align-items:center; gap:12px; }
.who{ font-size:13px; color:#334155; }
.badge{ font-size:11px; padding:2px 8px; border-radius:999px; margin-left:6px; text-decoration:none; cursor:pointer; border:0; }
.badge.user{ background:#ecfdf5; color:#047857; }
.badge.admin{ background:#eef2ff; color:#3730a3; }

/* ปุ่ม */
.btn{ font-size:13px; padding:6px 12px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; cursor:pointer; }
.btn:hover{ background:#f9fafb; }

@media (max-width:720px){
  .brand-main{ font-size:18px; }
  .brand-accent{ font-size:26px; }
  .nav-links{ gap:14px; }
}
</style>
