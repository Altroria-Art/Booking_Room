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
// TODO: ถ้ามีหน้า History จริง ให้เปลี่ยนจาก UserRooms เป็นไฟล์ของ History
const UserHistory = UserRooms

const routes = [
  // เริ่มที่ /login
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: Login },

  // ===== Admin =====
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', redirect: { name: 'admin.rooms' } },
      { path: 'rooms', name: 'admin.rooms', component: AdminRooms },
    ],
  },

  // ===== User (ทุกหน้าผ่าน UserLayout) =====
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: '', redirect: { name: 'user.rooms' } },

      // ชื่อหลักที่แนะนำให้ใช้
      { path: 'rooms',   name: 'user.rooms',   component: UserRooms },
      { path: 'review',  name: 'user.review',  component: UserReview },
      { path: 'history', name: 'user.history', component: UserHistory },

      // ✅ ชื่อเดิมเพื่อความเข้ากันได้กับโค้ดเก่า (push โดย name เดิม)
      { path: 'rooms-compat',   name: 'rooms',   redirect: { name: 'user.rooms' } },
      { path: 'review-compat',  name: 'review',  redirect: { name: 'user.review' } },
      { path: 'history-compat', name: 'history', redirect: { name: 'user.history' } },
    ],
  },

  // ===== เส้นทางสั้นระดับบน → redirect เข้า /user/...
  { path: '/rooms',   redirect: { name: 'user.rooms' } },
  { path: '/review',  redirect: { name: 'user.review' } },
  { path: '/history', redirect: { name: 'user.history' } },

  // กันหลงทาง
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
