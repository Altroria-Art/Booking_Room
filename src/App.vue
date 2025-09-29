<script setup>
import MainNavbar from './components/MainNavbar.vue'
import HeroSection from './components/HeroSection.vue'
import Popup from './components/Popup.vue'
import UserPopup from "./components/Popupprofile.vue"
import ReviewPage from './components/ReviewPage.vue'
import { ref } from 'vue'

// state popup การจอง
const show = ref(false)
const success = ref(false)

// state popup โปรไฟล์
const openPopup = ref(false)
const user = {
  firstName: "สมพล",
  lastName: "หยดย้อย",
  studentId: "67022928",
  phone: "0617584567"
}

// ฟังก์ชันเปิด popup การจอง
function showPopup(isSuccess) {
  success.value = isSuccess
  show.value = true
}

// ฟังก์ชันยกเลิกการจอง
function cancel() {
  alert("ยกเลิกการจองเรียบร้อยแล้ว")
  show.value = false
}
</script>

<template>
  <div>
    <!-- Navbar -->
    <MainNavbar />

    <!-- Hero Section -->
    <HeroSection />

    <!-- Review Section -->
    <ReviewPage />
  </div>

  <!-- ปุ่มทดสอบการจอง -->
  <div style="margin:20px">
    <button @click="showPopup(true)">จองสำเร็จ</button>
    <button @click="showPopup(false)">จองไม่สำเร็จ</button>

    <Popup 
      :show="show"
      :success="success"
      @close="show=false"
      @cancel="cancel"
    />
  </div>

  <!-- ปุ่มดูโปรไฟล์ -->
  <div style="margin:20px">
    <button @click="openPopup = true">ดูโปรไฟล์</button>
    <UserPopup 
      :show="openPopup" 
      :user="user" 
      @close="openPopup = false"
    />
  </div>
</template>
