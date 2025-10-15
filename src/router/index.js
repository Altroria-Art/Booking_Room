// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Auth / Login
const Login = () => import('../modules/auth/Login.vue')

// Admin
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const AdminRooms  = () => import('../modules/admin/pages/Rooms.vue')

// User
const UserLayout = () => import('../layouts/UserLayout.vue')
const UserRooms  = () => import('../modules/user/pages/Rooms.vue')

const routes = [
  // เปิดมาที่ root ให้เด้งไป /login
  { path: '/', redirect: '/login' },

  // หน้า Login (ตัวที่คุณใช้จริง)
  { path: '/login', name: 'login', component: Login },

  // กลุ่มหน้า Admin
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', redirect: { name: 'admin.rooms' } },
      { path: 'rooms', name: 'admin.rooms', component: AdminRooms },
    ],
  },

  // กลุ่มหน้า User
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: '', redirect: { name: 'rooms' } },
      { path: 'rooms', name: 'rooms', component: UserRooms },
    ],
  },

  // กันหลงทาง
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// (ตัวเลือก) ถ้าจะบังคับให้ต้องล็อกอินก่อนเข้า /admin หรือ /user
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('token')
//   const publicPages = ['/login']
//   const authRequired = !publicPages.includes(to.path)
//   if (authRequired && !token) return next('/login')
//   next()
// })

export default router
