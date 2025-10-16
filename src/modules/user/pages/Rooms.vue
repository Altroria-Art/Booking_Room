<!-- src/modules/user/pages/Rooms.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import ReviewRoom from '@/components/user/ReviewRoom.vue'
import BookingModal from '@/components/user/BookingModal.vue'

const showBooking = ref(false)
</script>

<template>
  <div class="page rooms">
    <button type="button" class="btn-book" @click="showBooking = true">
      <span>จองห้องประชุมที่นี่</span>
      <svg class="btn-icon" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="#FFFFFF"/>
        <path d="M24 16v16M16 24h16" stroke="#1F49FF" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </button>

    <BookingModal v-model:open="showBooking" />
    <ReviewRoom />
  </div>
</template>

<style scoped>
.btn-book{
  display:inline-flex; align-items:center; gap:12px;
  background:#1F49FF; color:#fff;
  padding:10px 16px; border:0; border-radius:12px;
  font:600 16px/1.2 system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans Thai', sans-serif;
  box-shadow:0 6px 16px rgba(31,73,255,.28);
  cursor:pointer; transition:filter .15s ease, transform .05s ease;
}
.btn-book:hover{ filter:brightness(1.08); }
.btn-book:active{ transform:translateY(1px); }
.btn-book:focus-visible{
  outline:none;
  box-shadow:0 0 0 3px #fff, 0 0 0 6px rgba(31,73,255,.6);
}

.btn-icon{ width:28px; height:28px; flex:0 0 auto; }
</style>
