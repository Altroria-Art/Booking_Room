// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// ----- Pages -----
const Login        = () => import('@/modules/auth/Login.vue')

// ----- Layouts -----
const UserLayout   = () => import('@/layouts/UserLayout.vue')
const AdminLayout  = () => import('@/layouts/AdminLayout.vue')

// ----- User pages -----
const UserRooms    = () => import('@/modules/user/pages/Rooms.vue')
const UserReview   = () => import('@/modules/user/pages/Review.vue')
// ถ้ายังไม่มีหน้า History ใช้ Rooms แทนก่อน
const UserHistory  = UserRooms

// ----- Admin pages -----
const AdminRooms   = () => import('@/modules/admin/pages/Rooms.vue')
const AdminReviews = () => import('@/modules/admin/pages/Reviews.vue')

const routes = [
  { path: '/', redirect: { name: 'login' } },

  // เข้าหน้า login ได้เสมอ (แม้ล็อกอินอยู่)
  { path: '/login', name: 'login', component: Login, meta: { public: true } },

  // เส้นทางลัดออกจากระบบ
  {
    path: '/logout',
    name: 'logout',
    meta: { public: true },
    beforeEnter: (_to, _from, next) => {
      const auth = useAuthStore()
      auth.clear()
      next({ name: 'login' })
    }
  },

  // ===== User (มี Layout) =====
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'user.rooms' } },
      { path: 'rooms',   name: 'user.rooms',   component: UserRooms },
      { path: 'review',  name: 'user.review',  component: UserReview },
      { path: 'history', name: 'user.history', component: UserHistory },
    ],
  },

  // ===== Admin (มี Layout + Hero) =====
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: { name: 'admin.rooms' } },
      // ค่าเริ่มต้น: Hero โชว์ (ตั้ง false ที่ meta ของหน้าใดหน้า1 ถ้าไม่อยากให้โชว์)
      { path: 'rooms',   name: 'admin.rooms',   component: AdminRooms,   meta: { showAdminHero: true } },
      { path: 'reviews', name: 'admin.reviews', component: AdminReviews, meta: { showAdminHero: true } },
    ],
  },

  // short path
  { path: '/rooms',   redirect: { name: 'user.rooms' } },
  { path: '/review',  redirect: { name: 'user.review' } },
  { path: '/history', redirect: { name: 'user.history' } },

  { path: '/:pathMatch(.*)*', redirect: { name: 'login' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ===== Guard: hydrate + ตรวจสิทธิ์ =====
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  // ฟื้น state หลังรีเฟรช
  if (!auth.user && (localStorage.getItem('user') || localStorage.getItem('token'))) {
    auth.hydrate?.()
  }

  // หน้า public (เช่น /login, /logout) → อนุญาตเสมอ
  if (to.matched.some(r => r.meta?.public)) {
    return next()
  }

  // ต้องล็อกอิน
  if (to.matched.some(r => r.meta?.requiresAuth) && !auth.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // ต้องเป็นแอดมิน
  if (to.matched.some(r => r.meta?.requiresAdmin) && !auth.isAdmin) {
    return next({ name: 'user.rooms' })
  }

  next()
})

export default router
