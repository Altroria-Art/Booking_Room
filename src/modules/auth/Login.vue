<template>
  <div class="max-w-sm mx-auto mt-20 p-6 border rounded-lg shadow space-y-3">
    <h1 class="text-2xl font-bold mb-4">เข้าสู่ระบบ (mock)</h1>

    <select v-model="role" class="border p-2 w-full rounded">
      <option value="user">เข้าสู่ระบบในฐานะ User</option>
      <option value="admin">เข้าสู่ระบบในฐานะ Admin</option>
    </select>

    <button
      @click="doLogin"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
    >
      เข้าสู่ระบบ
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()
const role = ref('user')

async function doLogin() {
  await auth.mockLogin(role.value) // ใช้ mock login
  if (role.value === 'admin') router.push({ name: 'admin.dashboard' })
  else router.push({ name: 'user.rooms' })
}
</script>
