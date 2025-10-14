import { createRouter, createWebHistory } from 'vue-router'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/store/auth' // ต้องมีไฟล์นี้

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ----- USER ZONE -----
    {
      path: '/',
      component: UserLayout,
      meta: { requiresAuth: true, roles: ['user','admin'] },
      children: [
        { path: '', redirect: { name: 'user.rooms' } }, // ใช้ Rooms เป็นหน้าแรก
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
      meta: { requiresAuth: true, roles: ['admin'] },
      children: [
        {
          path: '',
          name: 'admin.dashboard',
          component: () => import('@/modules/admin/pages/Dashboard.vue')
        }
      ]
    },

    // ----- AUTH -----
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/Login.vue')
    },

    // not found -> กลับหน้าแรก
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// ---- Route Guard: login + role ----
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta?.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta?.roles && auth.role && !to.meta.roles.includes(auth.role)) {
    return auth.role === 'admin' ? { name: 'admin.dashboard' } : { name: 'user.rooms' }
  }
})

export default router
