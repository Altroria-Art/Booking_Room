// // src/stores/auth.js
// import { defineStore } from 'pinia'

// export const useAuthStore = defineStore('auth', {
//   state: () => ({
//     user: JSON.parse(localStorage.getItem('user') || 'null'),
//     token: localStorage.getItem('token') || null,
//   }),
// getters: {
//   isLoggedIn: (s) => !!s.user,
//   displayName: (s) => s.user?.display_name || '',
//   studentId:  (s) => s.user?.student_id || '',
//   roleUpper:  (s) => (s.user?.role || 'USER').toUpperCase(),
//   isAdmin:    (s) => (s.user?.role || '').toUpperCase() === 'ADMIN',
// },

//   actions: {
//     setSession({ user, token }) {
//       this.user = user; this.token = token
//       localStorage.setItem('user', JSON.stringify(user))
//       localStorage.setItem('token', token)
//     },
//     clear() {
//       this.user = null; this.token = null
//       localStorage.removeItem('user'); localStorage.removeItem('token')
//     }
//   }
// })

// แนะนำให้วางที่: src/store/auth.js   (หรือจะเก็บที่ src/stores/auth.js ก็ได้ แต่ต้องแก้ import ให้ตรง)
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
    isLoggedIn: (s) => !!s.user,
    displayName: (s) => s.user?.display_name || '',
    studentId:  (s) => s.user?.student_id || '',
    roleUpper:  (s) => (s.user?.role || 'USER').toUpperCase(),
    isAdmin:    (s) => (s.user?.role || '').toUpperCase() === 'ADMIN',
  },

  actions: {
    /** ใช้ตอน login สำเร็จ */
    setSession({ user, token }) {
      // ป้องกันกรณี user ไม่มี role
      const safeUser = { role: 'USER', ...user }
      this.user  = safeUser
      this.token = token || null

      localStorage.setItem('user', JSON.stringify(safeUser))
      if (this.token) localStorage.setItem('token', this.token)
      else localStorage.removeItem('token')
    },

    /** อัปเดตข้อมูล user บางส่วน โดยไม่กระทบ token */
    updateUser(patch = {}) {
      if (!this.user) return
      this.user = { ...this.user, ...patch }
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    /** ใช้ฟื้น state หลัง refresh (ถ้าจำเป็น) */
    loadFromStorage() {
      this.user  = readJSON('user', null)
      this.token = localStorage.getItem('token') || null
    },

    /** logout */
    clear() {
      this.user  = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
  },
})