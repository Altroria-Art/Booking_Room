import { createRouter, createWebHistory } from 'vue-router'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

// NOTE: ถ้าคุณเก็บ store ไว้ที่ `src/store/auth.js` ให้ใช้บรรทัดนี้
import { useAuthStore } from '@/store/auth'

// ถ้าเก็บไว้ที่ `src/stores/auth.js` ให้สลับมาใช้บรรทัดนี้แทน
// import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ----- USER ZONE -----
    {
      path: '/',
      component: UserLayout,
      // ให้ทั้ง USER/ADMIN เข้าตรงนี้ได้ (admin เข้ามาดูฝั่ง user ได้)
      meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] },
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
      // จำกัดเฉพาะ ADMIN เท่านั้น
      meta: { requiresAuth: true, roles: ['ADMIN'] },
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
      component: () => import('@/modules/auth/Login.vue'),
      meta: { guestOnly: true } // ถ้า login แล้ว ไม่ควรอยู่หน้านี้
    },

    // not found -> กลับหน้าแรก
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

/**
 * ---- Route Guard: ตรวจ token + บังคับ role ----
 * - รองรับ role จาก backend ที่ส่งมาเป็น 'USER'|'ADMIN'
 * - ถ้าคอนฟิกใน meta ใช้ตัวพิมพ์เล็ก/ใหญ่ปนกัน เราจะ normalize เป็น UPPERCASE
 */
router.beforeEach((to) => {
  const auth = useAuthStore()

  // ถ้าล็อกอินแล้ว แต่ไปหน้า login ให้เด้งออก
  if (to.meta?.guestOnly && auth.isLoggedIn) {
    return auth.roleUpper === 'ADMIN'
      ? { name: 'admin.dashboard' }
      : { name: 'user.rooms' }
  }

  // ต้องล็อกอิน?
  if (to.meta?.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // เช็คสิทธิ์ role ถ้าหน้านั้นกำหนดไว้
  if (to.meta?.roles && auth.isLoggedIn) {
    // แปลง roles ใน meta ให้เป็นตัวพิมพ์ใหญ่
    const allowed = to.meta.roles.map(r => String(r).toUpperCase())
    const myRole = auth.roleUpper // เราจะไปเพิ่ม getter นี้ใน store
    if (!allowed.includes(myRole)) {
      // ถ้าไม่มีสิทธิ์: ส่งไปหน้าที่เหมาะกับ role ตัวเอง
      return myRole === 'ADMIN'
        ? { name: 'admin.dashboard' }
        : { name: 'user.rooms' }
    }
  }
})

export default router
