<script setup>
import MainNavbar from './components/MainNavbar.vue'
import { ref } from "vue";
import UserPopup from "./components/Popupprofile.vue";

const showPopup = ref(false);

const user = {
  firstName: "สมพล",
  lastName: "หยดย้อย",
  studentId: "67022928",
  phone: "0617584567"
};
</script>

<template>
  <div>
    <button @click="showPopup = true">ดูโปรไฟล์</button>

    <UserPopup 
      :show="showPopup" 
      :user="user" 
      @close="showPopup = false"
    />
  </div>
</template>