<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.clear()
  router.replace('/login')
}

// ปุ่ม ADMIN ยังอยู่ กดไปหลังบ้านได้
function goAdminSafe(path = '/admin') {
  router.push(path).catch(() => {})
}
</script>

<template>
  <header class="nav">
    <div class="nav-wrap">
      <!-- โลโก้ -->
      <router-link to="/" class="brand">
        <span class="brand-main">Booking</span>
        <span class="brand-accent">Room</span>
      </router-link>

      <!-- ✅ เอาส่วนเมนูออกแล้ว -->

      <!-- ขวา -->
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
.nav { background:#fff; margin:0; width:100%; box-shadow:0 6px 18px rgba(0,0,0,.05); }
.nav-wrap{ display:flex; align-items:center; justify-content:space-between; padding:18px 22px; gap:16px; max-width:1120px; margin:0 auto; }

.brand{ display:inline-flex; gap:8px; text-decoration:none; align-items:baseline; letter-spacing:.5px; }
.brand-main{ font-weight:800; color:#1f2d3d; font-size:22px; }
.brand-accent{ font-weight:900; color:#5865f2; font-size:32px; line-height:1; }

.nav-right{ display:inline-flex; align-items:center; gap:12px; }
.who{ font-size:13px; color:#334155; }
.badge{ font-size:11px; padding:2px 8px; border-radius:999px; margin-left:6px; cursor:pointer; border:0; }
.badge.user{ background:#ecfdf5; color:#047857; }
.badge.admin{ background:#eef2ff; color:#3730a3; }

.btn{ font-size:13px; padding:6px 12px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; cursor:pointer; }
.btn:hover{ background:#f9fafb; }
</style>
