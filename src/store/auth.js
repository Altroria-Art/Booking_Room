import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    role: null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token
  },
  actions: {
    // ฟังก์ชันจำลองล็อกอิน (ใช้เทส flow ได้เลย)
    async mockLogin(role = 'user') {
      this.token = 'mock-token'
      this.role = role
    },
    logout() {
      this.token = null
      this.role = null
    }
  }
})
