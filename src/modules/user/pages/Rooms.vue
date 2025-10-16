<!-- src/modules/user/pages/Rooms.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import ReviewRoom from '@/components/user/ReviewRoom.vue'
import BookingModal from '@/components/user/BookingModal.vue'

const showBooking = ref(false)

const todayLabel = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
}).format(new Date())
</script>

<template>
  <div class="page rooms">
    <!-- หัวข้อ -->
    <header class="page-title">
      <span class="th">จองห้อง</span>
      <span class="en">Study Room</span>
    </header>

    <!-- แถววันที่ + ปุ่มจอง -->
    <div class="date-row">
      <div class="today">{{ todayLabel }}</div>

      <button type="button" class="btn-book" @click="showBooking = true">
        <span>จองห้องประชุมที่นี่</span>
        <svg class="btn-icon" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="#FFFFFF"/>
          <path d="M24 16v16M16 24h16" stroke="#1F49FF" stroke-width="4" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <BookingModal v-model:open="showBooking" />
    <ReviewRoom />
  </div>
</template>

<style scoped>
/* ระยะห่างจากขอบ */
.rooms{
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* หัวข้อ + เส้นแนวตั้ง */
.page-title{
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: .5rem;
  padding-left: 14px;
  margin: 8px 0 12px;
}
.page-title::before{
  content: '';
  position: absolute;
  left: 0; top: 2px; bottom: -4px;
  width: 4px; border-radius: 2px;
  background: #5b6acf;
}
/* — ขยายขนาดหัวข้อ — */
.page-title .th,
.page-title .en{
  line-height: 1.16;
  font-size: 1.55rem;   /* เดิม ~1.25rem → ขยาย */
}
.page-title .th{
  font-weight: 400;     /* ดำบาง ๆ ตามที่ขอ */
  color: #374151;
  letter-spacing: .1px;
}
.page-title .en{
  font-weight: 700;     /* Study Room ให้หนาชัด */
  color: #1f2937;
}

/* แถววันที่ + ปุ่ม */
.date-row{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0 14px;
  border-bottom: 1px solid #e5e7eb;
}
/* — ขยายขนาดวันที่ — */
.today{
  font-size: 1.25rem;   /* เดิม ~1.05rem → ขยาย */
  font-weight: 700;
  color: #111827;
}

/* ปุ่มจอง — ทำให้เล็กลงนิดนึง */
.btn-book{
  display:inline-flex; align-items:center; gap:10px;
  background:#1F49FF; color:#fff;
  padding:8px 14px;              /* เดิม 10px 16px → เล็กลง */
  border:0; border-radius:10px;  /* เดิม 12px */
  font:600 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans Thai', sans-serif; /* เดิม 16px */
  box-shadow:0 4px 12px rgba(31,73,255,.25); /* เดิม 0 6px 16px */
  cursor:pointer; transition:filter .15s ease, transform .05s ease;
}
.btn-book:hover{ filter:brightness(1.08); }
.btn-book:active{ transform:translateY(1px); }
.btn-book:focus-visible{
  outline:none;
  box-shadow:0 0 0 3px #fff, 0 0 0 6px rgba(31,73,255,.6);
}
.btn-icon{ width:22px; height:22px; flex:0 0 auto; } /* เดิม 28px */
</style>
