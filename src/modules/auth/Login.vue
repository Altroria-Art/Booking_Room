<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

// เลือกบทบาทจาก dropdown (default = USER)
const role = ref('USER')

// รองรับ hint จาก /?as=USER|ADMIN
onMounted(() => {
  const hint = String(route.query.as || '').toUpperCase()
  if (hint === 'ADMIN' || hint === 'USER') role.value = hint
})

function doLogin() {
  // จำลอง user object ให้เหมือน payload จาก backend
  const user = role.value === 'ADMIN'
    ? { id: 2, username: 'admin001', role: 'ADMIN', display_name: 'Admin Library', student_id: null, phone: null, email: 'admin@lib.local' }
    : { id: 1, username: 'u67022928', role: 'USER',  display_name: 'สมพล หยดย้อย', student_id: '67022928', phone: '0617584567', email: '67022928@ku.th' }

  auth.setSession({ user, token: 'dev-token' })

  // ถ้ามี redirect มากับ query ให้กลับไปหน้านั้นก่อน
  const redirectTo = route.query.redirect
  if (redirectTo && typeof redirectTo === 'string') {
    router.replace(redirectTo)
    return
  }

  // ไปหน้าเริ่มต้นตามบทบาท
  if (user.role === 'ADMIN') {
    router.replace({ name: 'admin.rooms' })
  } else {
    router.replace({ name: 'user.rooms' }) // ใช้ชื่อ route ใหม่ให้ชัดเจน
  }
}
</script>

<template>
  <section class="login">
    <h1 class="title">เข้าสู่ระบบ</h1>

    <div class="row">
      <select v-model="role">
        <option value="USER">เข้าสู่ระบบในฐานะ User</option>
        <option value="ADMIN">เข้าสู่ระบบในฐานะ Admin</option>
      </select>
      <button @click="doLogin">เข้าสู่ระบบ</button>
    </div>
  </section>
</template>

<style scoped>
.login { max-width: 640px; margin: 40px auto; padding: 0 16px; }
.title { font-size: 32px; font-weight: 800; margin: 0 0 16px; }
.row { display: flex; gap: 8px; align-items: center; }
</style>
