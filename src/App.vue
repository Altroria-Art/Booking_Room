<script setup>
  import MainNavbar from './components/MainNavbar.vue'
  import HeroSection from './components/HeroSection.vue'
  import Popup from './components/Popup.vue'
  import { ref } from 'vue'
  import UserPopup from "./components/Popupprofile.vue";
  import ReviewRoom from './components/ReviewRoom.vue';

  const show = ref(false)
  const success = ref(false)

  const openPopup = ref(false);
  const user = {
    firstName: "สมพล",
    lastName: "หยดย้อย",
    studentId: "67022928",
    phone: "0617584567"
  };

  function showPopup(isSuccess) {
    success.value = isSuccess
    show.value = true
  }

  function cancel() {
    alert("ยกเลิกการจองเรียบร้อยแล้ว")
    show.value = false
  }
</script>

<template>
  <div>
    <MainNavbar />
    <HeroSection />
    <ReviewRoom />
  </div>

  <div>
    <button @click="showPopup(true)">จองสำเร็จ</button>
    <button @click="showPopup(false)">จองไม่สำเร็จ</button>

    <Popup 
      :show="show"
      :success="success"
      @close="show=false"
      @cancel="cancel"
    />
  </div>

  <div>
    <button @click="openPopup = true">ดูโปรไฟล์</button>

    <UserPopup 
      :show="openPopup" 
      :user="user" 
      @close="openPopup = false"
    />
  </div>
</template>