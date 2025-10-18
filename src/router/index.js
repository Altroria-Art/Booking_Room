// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// ===== Pages =====
const Login        = () => import('@/modules/auth/Login.vue')

// ===== Layouts =====
const UserLayout   = () => import('@/layouts/UserLayout.vue')
const AdminLayout  = () => import('@/layouts/AdminLayout.vue')

// ===== User pages =====
const UserRooms    = () => import('@/modules/user/pages/Rooms.vue')
const UserReview   = () => import('@/modules/user/pages/Review.vue')
// ถ้ายังไม่มีหน้า History ใช้ Rooms แทนก่อน
const UserHistory  = UserRooms

// ===== Admin pages =====
const AdminRooms   = () => import('@/modules/admin/pages/Rooms.vue')
const AdminReviews = () => import('@/modules/admin/pages/Reviews.vue')

const routes = [
  { path: '/', redirect: { name: 'login' } },

  // public
  { path: '/login',  name: 'login',  component: Login,  meta: { public: true } },
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
      { path: '',         redirect: { name: 'user.rooms' } },
      { path: 'rooms',    name: 'user.rooms',   component: UserRooms },
      { path: 'review',   name: 'user.review',  component: UserReview },
      { path: 'history',  name: 'user.history', component: UserHistory },
    ],
  },

  // ===== Admin (มี Layout + Guard แอดมิน) =====
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '',        redirect: { name: 'admin.rooms' } },

      // แสดง Hero ที่หน้า rooms
      {
        path: 'rooms',
        name: 'admin.rooms',
        component: AdminRooms,
        meta: { showAdminHero: true },
      },

      // หน้ารีวิวของแอดมิน (ซ่อน Hero เพื่อให้โฟกัสที่เนื้อหา)
      {
        path: 'reviews',
        name: 'admin.reviews',
        component: AdminReviews,
        meta: { showAdminHero: false },
        // รองรับพาธเอกพจน์ /admin/review ถ้าเผลอใช้
        alias: ['/admin/review'],
      },
    ],
  },

  // short path
  { path: '/rooms',   redirect: { name: 'user.rooms' } },
  { path: '/review',  redirect: { name: 'user.review' } },
  { path: '/history', redirect: { name: 'user.history' } },

  // 404 → login
  { path: '/:pathMatch(.*)*', redirect: { name: 'login' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // เลื่อนขึ้นบนเมื่อเปลี่ยนหน้า (โดยเฉพาะจาก hero ไปรีวิว)
  scrollBehavior() {
    return { top: 0 }
  },
})

// ===== Guard: hydrate + ตรวจสิทธิ์ =====
router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  // ฟื้น state หลังรีเฟรช (ถ้า hydrate เป็น async ให้รอ)
  if (!auth.user && (localStorage.getItem('user') || localStorage.getItem('token'))) {
    await (auth.hydrate?.())
  }

  // หน้า public → อนุญาตเสมอ
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
