// src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
  }),
getters: {
  isLoggedIn: (s) => !!s.user,
  displayName: (s) => s.user?.display_name || '',
  studentId: (s) => s.user?.student_id || '',
  roleUpper: (s) => (s.user?.role || 'USER').toUpperCase(),
  isAdmin:  (s) => (s.user?.role || '').toUpperCase() === 'ADMIN',
},

  actions: {
    setSession({ user, token }) {
      this.user = user
      this.token = token
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
    },
    clear() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }
})
