<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

// กรณี mock: dropdown role
const role = ref('USER')

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

  // กลับไปหน้าเดิมถ้ามี redirect
  const redirectTo = route.query.redirect
  if (redirectTo && typeof redirectTo === 'string') {
    return router.replace(redirectTo)
  }
  // ไม่งั้นเด้งตาม role
  if (auth.roleUpper === 'ADMIN') router.replace({ name: 'admin.dashboard' })
  else router.replace({ name: 'user.rooms' })
}
</script>

<template>
  <div>
    <select v-model="role">
      <option value="USER">เข้าสู่ระบบในฐานะ User</option>
      <option value="ADMIN">เข้าสู่ระบบในฐานะ Admin</option>
    </select>
    <button @click="doLoginMock">เข้าสู่ระบบ</button>
  </div>
</template>
