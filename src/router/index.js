import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'   // ⬅ เพิ่มเพื่อใช้ใน guard

// Layouts
const UserLayout  = () => import('@/layouts/UserLayout.vue')
const AdminLayout = () => import('@/layouts/AdminLayout.vue')

// Auth
const Login = () => import('@/modules/auth/Login.vue')

// User pages (อยู่ใน src/modules/user/pages)
const UserRooms  = () => import('@/modules/user/pages/Rooms.vue')
const UserReview = () => import('@/modules/user/pages/Review.vue')

// Admin pages (อยู่ใน src/modules/admin/pages)
const AdminDashboard = () => import('@/modules/admin/pages/Dashboard.vue')
const AdminRooms     = () => import('@/modules/admin/pages/Rooms.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ----- Public/Auth -----
    { path: '/login', name: 'login', component: Login },

    // ----- User Area (มี layout) -----
    {
      path: '/',
      component: UserLayout,
      children: [
        // หน้าแรกให้ไปหน้า Rooms ของ user เลย
        { path: '',        name: 'home',   component: UserRooms },
        { path: 'rooms',   name: 'rooms',  component: UserRooms },
        { path: 'review',  name: 'review', component: UserReview },
      ],
    },

    // ----- Admin Area (มี layout) -----
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        // ✅ ใส่ชื่อ admin.dashboard ให้ตรงกับลิงก์เดิม ๆ
        // { path: '',        
        //   name: 'admin.dashboard', 
        //   component: AdminDashboard },
         // ✅ เมื่อเข้าที่ /admin ให้ redirect ไป /admin/rooms ทันที

        // ✅ หน้า “จองห้อง (Admin)” เป็นหน้าหลัก
        { path: '', redirect: { name: 'admin.rooms' } },

        // ✅ หน้า “จองห้อง (Admin)” เป็นหน้าหลัก
        { path: 'rooms',   name: 'admin.rooms', component: AdminRooms },
      ],
    },

    // ----- 404 -----
    { path: '/:pathMatch(.*)*', 
      name: 'notfound', 
      component: { template: '<div style="padding:20px">Not Found</div>' } },
  ],
})

/* =========================
   ✅ Global Auth Guard
   - ถ้ายังไม่ล็อกอิน → บังคับไป /login
   - ถ้าล็อกอินแล้ว แต่ไป /login → เด้งไปหน้าตาม role
   - รองรับ redirect กลับไปหน้าที่ตั้งใจเข้าทีหลัง
   ========================= */
const PUBLIC = new Set(['login'])

router.beforeEach((to) => {
  const auth = useAuthStore()
  const loggedIn = !!auth?.isLoggedIn

  // ยังไม่ล็อกอินและหน้าไม่ใช่ public -> ไป login
  if (!loggedIn && !PUBLIC.has(to.name)) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // ล็อกอินแล้วแต่จะไปหน้า login -> เด้งตาม role
  if (loggedIn && to.name === 'login') {
    return auth.isAdmin ? { name: 'admin.rooms' } : { name: 'rooms' }
  }

  return true
})

export default router
