// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Auth / Login
const Login = () => import('../modules/auth/Login.vue')

// Admin
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const AdminRooms  = () => import('../modules/admin/pages/Rooms.vue')

// User
const UserLayout  = () => import('../layouts/UserLayout.vue')
const UserRooms   = () => import('../modules/user/pages/Rooms.vue')
const UserReview  = () => import('../modules/user/pages/Review.vue')
// ถ้ามีหน้า History จริง ให้ import แล้วเปลี่ยน component ของ route 'history' ด้านล่าง
// const UserHistory = () => import('../modules/user/pages/History.vue')

const routes = [
  // เริ่มที่ /login
  { path: '/', redirect: '/login' },

  { path: '/login', name: 'login', component: Login },

  // Admin
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', redirect: { name: 'admin.rooms' } },
      { path: 'rooms', name: 'admin.rooms', component: AdminRooms },
    ],
  },

  // User
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: '', redirect: { name: 'rooms' } },

      // --- ชื่อ route "แบบเดิม" (rooms/review/history) ---
      { path: 'rooms',   name: 'rooms',   component: UserRooms,  alias: ['/rooms'] },
      { path: 'review',  name: 'review',  component: UserReview, alias: ['/review'] },
      // ยังไม่มีหน้าหลักฐาน? ชี้ไป Rooms ชั่วคราว กัน 404
      { path: 'history', name: 'history', component: UserRooms,  alias: ['/history'] },

      // --- ชื่อ route "แบบมี prefix user.*" เพื่อความเข้ากันได้กับโค้ดที่เรียกชื่อนี้ ---
      { path: 'rooms-compat',   name: 'user.rooms',   redirect: { name: 'rooms' } },
      { path: 'review-compat',  name: 'user.review',  redirect: { name: 'review' } },
      { path: 'history-compat', name: 'user.history', redirect: { name: 'history' } },
    ],
  },

  // กันหลงทาง
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
