<script setup>
 import MainNavbar from './components/MainNavbar.vue'
 import HeroSection from './components/HeroSection.vue'
 import Popup from './components/Popup.vue'
 import { ref } from 'vue'

const show = ref(false)
const success = ref(false)

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

    <button @click="showPopup(true)">จองสำเร็จ</button>
    <button @click="showPopup(false)">จองไม่สำเร็จ</button>

    <Popup 
      :show="show"
      :success="success"
      @close="show=false"
      @cancel="cancel"
    />
  </div>
</template>
