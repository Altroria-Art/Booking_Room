import { createRouter, createWebHistory } from 'vue-router'
import Rooms from '../pages/Rooms.vue'
import Review from '../pages/Review.vue' // ✅ นำเข้า Review Page

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Rooms },
    { path: '/review', component: Review }, // ✅ เพิ่ม Route รีวิว
  ],
})
