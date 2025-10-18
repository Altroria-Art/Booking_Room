<template>
  <header class="nav">
    <div class="wrap">
      <router-link class="brand" :to="homeLink">
        <span class="b1">Booking</span><span class="b2">Room</span>
      </router-link>

      <div class="right">
        <span v-if="auth.isLoggedIn" class="who">
          สวัสดี, <strong>{{ auth.displayName || 'ผู้ใช้' }}</strong>
          <em v-if="auth.studentId"> ({{ auth.studentId }})</em>
          <span class="badge" :class="auth.isAdmin ? 'ad' : 'us'">
            {{ auth.isAdmin ? 'ADMIN' : 'USER' }}
          </span>
        </span>

        <button v-if="auth.isAdmin" class="btn" @click="goAdmin">หลังบ้าน</button>
        <button class="btn" @click="goRooms">ห้องจอง</button>
        <button v-if="auth.isLoggedIn" class="btn danger" @click="logout">ออกจากระบบ</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
const router = useRouter()
const auth   = useAuthStore()

const homeLink = { name: 'user.rooms' }

function goAdmin(){ router.push({ name: 'admin.rooms' }).catch(()=>{}) }
function goRooms(){ router.push({ name: 'user.rooms' }).catch(()=>{}) }
function logout(){ auth.clear(); router.replace({ name: 'login' }) }
</script>

<style scoped>
.nav{ position:fixed; inset:0 0 auto; background:#0f172a; color:#fff; z-index:10; }
.wrap{ max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:10px 20px; }
.brand{ display:inline-flex; align-items:baseline; gap:6px; font-weight:800; color:#fff; text-decoration:none; }
.b1{ font-size:18px; opacity:.9; } .b2{ font-size:18px; color:#60a5fa; }
.right{ display:flex; align-items:center; gap:10px; }
.who{ opacity:.95; }
.who em{ opacity:.8; font-style:normal }
.badge{ margin-left:8px; padding:2px 8px; border-radius:999px; font-weight:800; font-size:12px; }
.badge.us{ background:#93c5fd; color:#0f172a }
.badge.ad{ background:#facc15; color:#0f172a }
.btn{ background:#1e293b; color:#fff; border:0; border-radius:10px; padding:7px 12px; font-weight:700; cursor:pointer }
.btn:hover{ filter:brightness(1.1) }
.btn.danger{ background:#ef4444 }
</style>
