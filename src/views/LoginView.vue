<script setup>
import { ref } from 'vue'
import api from '@/plugins/axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const router = useRouter()
const auth = useAuthStore()

async function doLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await api.post('/auth/login', { username: username.value, password: password.value })
    auth.setSession({ user: data.user, token: data.token })
    // เปลี่ยนทางตาม role
    if (data.user.role === 'ADMIN') router.push('/admin')
    else router.push('/')
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <h1>เข้าสู่ระบบ</h1>
    <input v-model="username" placeholder="username" />
    <input v-model="password" type="password" placeholder="password" />
    <button :disabled="loading" @click="doLogin">เข้าสู่ระบบ</button>
    <p v-if="errorMsg" style="color:red">{{ errorMsg }}</p>
  </div>
</template>
