<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

function logout() {
  auth.clear()
  router.replace({ name: 'login' })
}

const menu = [
  { name: 'ห้องทั้งหมด', to: { name: 'user.rooms' }, key: 'rooms' },
  { name: 'รายการจองของฉัน', to: { name: 'user.review' }, key: 'review' }
]

const activeName = computed(() => route.name)
</script>

<template>
  <header class="w-full border-b bg-white/80 backdrop-blur">
    <div class="mx-auto max-w-6xl flex items-center gap-4 px-4 py-3">
      <router-link to="/" class="font-semibold text-lg">Booking Room</router-link>

      <nav class="flex items-center gap-3">
        <router-link
          v-for="m in menu" :key="m.key"
          :to="m.to"
          class="px-3 py-1 rounded hover:bg-gray-100"
          :class="{'bg-gray-100 font-medium': activeName===m.to.name}"
        >{{ m.name }}</router-link>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <template v-if="auth.isLoggedIn">
          <span class="text-sm text-gray-700">
            สวัสดี, <strong>{{ auth.displayName }}</strong>
            <span v-if="auth.studentId"> ({{ auth.studentId }})</span>
          </span>
          <span class="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700"
                v-if="!auth.isAdmin">USER</span>
          <router-link v-if="auth.isAdmin"
                       class="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700"
                       :to="{ name: 'admin.dashboard' }">ADMIN</router-link>

          <button class="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                  @click="logout">ออกจากระบบ</button>
        </template>
        <template v-else>
          <router-link class="text-sm px-3 py-1 rounded border hover:bg-gray-50" to="/login">
            เข้าสู่ระบบ
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* แถบ navbar */
.nav {
  background: #ffffff;
  margin: 0;
  width: 100%;
  box-shadow: 0 6px 18px rgba(0,0,0,.05);
}

/* คอนเทนต์ด้านใน */
.nav-wrap{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
}

/* โลโก้ */
.brand{
  display: inline-flex;
  gap: 8px;
  text-decoration: none;
  align-items: baseline;
  letter-spacing: .5px;
}
.brand-main{
  font-weight: 800;
  color: #1f2d3d;
  font-size: 22px;
}
.brand-accent{
  font-weight: 900;
  color: #5865f2;
  font-size: 32px;
  line-height: 1;
}

/* ลิงก์ขวา */
.nav-links{
  display: inline-flex;
  align-items: center;
  gap: 28px;
}
.link{
  position: relative;
  font-size: 14px;
  color: #334155;
  text-decoration: none;   /* ตัดเส้นใต้ทั้งหมด */
  padding-bottom: 0;       /* ไม่เผื่อพื้นที่เส้นใต้ */
}

/* ปิด pseudo-element ทุกกรณี (กันพลาด) */
.link::after,
.link:hover::after,
.link.router-link-active::after,
.link.router-link-exact-active::after{
  content: none !important;
  display: none !important;
}

/* hover แค่เปลี่ยนสีตัวอักษรเล็กน้อย */
.link:hover{ color:#111827; }

@media (max-width: 720px){
  .brand-main{ font-size: 18px; }
  .brand-accent{ font-size: 26px; }
  .nav-links{ gap: 18px; }
}
</style>
