<!-- src/modules/user/pages/Rooms.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import ReviewRoom from '@/components/user/ReviewRoom.vue'
import BookingModal from '@/components/user/BookingModal.vue'

// state คุมโมดัลของหน้า Rooms โดยตรง
const showBooking = ref(false)
</script>

<template>
  <div class="page rooms">
    <button type="button" @click="showBooking = true">ยืนยันการจอง</button>
    <BookingModal v-model:open="showBooking" />

    <!-- รีวิวอยู่ในหน้านี้ต่อได้เลย -->
    <ReviewRoom />
  </div>
</template>
