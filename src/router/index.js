// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/store/auth' // ใช้ path นี้ตามโปรเจคคุณ

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ----- USER ZONE -----
    {
      path: '/',
      component: UserLayout,
      meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
      children: [
        { path: '', redirect: { name: 'user.rooms' } }, // หน้าแรกของ user
        {
          path: 'rooms',
          name: 'user.rooms',
          component: () => import('@/modules/user/pages/Rooms.vue')
        },
        {
          path: 'review',
          name: 'user.review',
          component: () => import('@/modules/user/pages/Review.vue')
        }
      ]
    },

    // ----- ADMIN ZONE -----
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, roles: ['ADMIN'] }, // ใช้ตัวพิมพ์ใหญ่ให้ตรงกับ roleUpper
      children: [
        { path: '', redirect: { name: 'admin.rooms' } }, // ไม่มี Dashboard → ชี้ไป rooms
        {
          path: 'rooms',
          name: 'admin.rooms',
          component: () => import('@/modules/admin/pages/Rooms.vue')
        }
      ]
    },

    // ----- AUTH -----
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/Login.vue'),
      meta: { guestOnly: true }
    },

    // not found -> กลับหน้าแรก
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

/**
 * ---- Route Guard: ตรวจ token + บังคับ role ----
 * - รองรับ role จาก backend เป็น 'USER'|'ADMIN'
 * - normalize meta.roles เป็นตัวพิมพ์ใหญ่
 */
router.beforeEach((to) => {
  const auth = useAuthStore()

  // ถ้าล็อกอินแล้ว ไม่ให้ค้างที่ /login
  if (to.meta?.guestOnly && auth.isLoggedIn) {
    return auth.roleUpper === 'ADMIN'
      ? { name: 'admin.rooms' }
      : { name: 'user.rooms' }
  }

  // ต้องล็อกอิน
  if (to.meta?.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // เช็คสิทธิ์ role
  if (to.meta?.roles && auth.isLoggedIn) {
    const allowed = to.meta.roles.map(r => String(r).toUpperCase())
    const myRole = auth.roleUpper
    if (!allowed.includes(myRole)) {
      return myRole === 'ADMIN'
        ? { name: 'admin.rooms' }
        : { name: 'user.rooms' }
    }
  }
})

export default router
