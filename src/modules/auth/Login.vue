<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

// mock: เลือกบทบาทจาก dropdown (default = USER)
const role = ref('USER')

// รองรับ hint จาก /?as=USER|ADMIN (มาจากหน้าเลือกบทบาท)
onMounted(() => {
  const hint = String(route.query.as || '').toUpperCase()
  if (hint === 'ADMIN' || hint === 'USER') role.value = hint
})

function doLoginMock() {
  // จำลอง user object ให้เหมือน payload จาก backend
  const user = role.value === 'ADMIN'
    ? {
        id: 2, username: 'admin001', role: 'ADMIN',
        display_name: 'Admin Library', student_id: null, phone: null, email: 'admin@lib.local'
      }
    : {
        id: 1, username: 'u67022928', role: 'USER',
        display_name: 'สมพล หยดย้อย', student_id: '67022928', phone: '0617584567', email: '67022928@ku.th'
      }

  auth.setSession({ user, token: 'mock-token' })

  // ถ้ามี redirect มากับ query ให้ไปหน้านั้นก่อน
  const redirectTo = route.query.redirect
  if (redirectTo && typeof redirectTo === 'string') {
    return router.replace(redirectTo)
  }

  // ไม่งั้นเด้งตาม role (อัปเดตแล้ว: admin.rooms / user.rooms)
  if (auth.roleUpper === 'ADMIN') return router.replace({ name: 'admin.rooms' })
  return router.replace({ name: 'user.rooms' })
}
</script>

<template>
  <div>
    <h1>เข้าสู่ระบบ (mock)</h1>
    <select v-model="role">
      <option value="USER">เข้าสู่ระบบในฐานะ User</option>
      <option value="ADMIN">เข้าสู่ระบบในฐานะ Admin</option>
    </select>
    <button @click="doLoginMock">เข้าสู่ระบบ</button>
  </div>
</template>
