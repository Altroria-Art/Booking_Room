import { defineStore } from 'pinia'

function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user:  readJSON('user', null),
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    isLoggedIn: (s) => !!s.user && !!s.token,
    displayName: (s) => s.user?.display_name || '',
    studentId:  (s) => s.user?.student_id || '',
    roleUpper:  (s) => String(s.user?.role || 'USER').toUpperCase(),
    isAdmin:    (s) => String(s.user?.role || '').toUpperCase() === 'ADMIN',
  },

  actions: {
    setSession({ user, token }) {
      const safeUser = { role: 'USER', ...user }
      safeUser.role = String(safeUser.role || 'USER').toUpperCase()

      this.user  = safeUser
      this.token = token || null

      localStorage.setItem('user', JSON.stringify(safeUser))
      if (this.token) localStorage.setItem('token', this.token)
      else localStorage.removeItem('token')
    },

    updateUser(patch = {}) {
      if (!this.user) return
      const next = { ...this.user, ...patch }
      if (next.role) next.role = String(next.role).toUpperCase()
      this.user = next
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    loadFromStorage() {
      this.user  = readJSON('user', null)
      this.token = localStorage.getItem('token') || null
    },

    hydrate() { this.loadFromStorage() },

    clear() {
      this.user  = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
  },
})
