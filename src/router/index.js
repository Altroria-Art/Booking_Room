import { createRouter, createWebHistory } from 'vue-router'
import Rooms from '../pages/Rooms.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Rooms }, // ชั่วคราวให้หน้าแรกคือ Rooms
  ],
})
