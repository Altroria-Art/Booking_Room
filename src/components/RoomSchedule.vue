<script setup>
import { computed, ref } from 'vue'

// กำหนดช่วงเวลา (ชั่วโมงเต็ม)
const startHour = 8
const endHour = 18   // 8.00–18.00

// header เวลา
const hours = computed(() => {
  const arr = []
  for (let h = startHour; h <= endHour; h++) arr.push(h)
  return arr
})

// รายชื่อห้อง (แถวซ้าย)
const rooms = ref([
  'CE08401', 'CE08402', 'CE08403', 'CE08404',
  'CE08405', 'CE08406', 'CE08407', 'CE08408',
])

// อีเวนต์ตัวอย่าง
// room: ห้อง, start/end: เวลาในรูปแบบ 'HH:MM'
const events = ref([
  { room: 'CE08401', title: 'ธนพร [67025044]', start: '08:00', end: '09:00', status: 'free' },
  { room: 'CE08402', title: 'ธนพร [67025044]', start: '10:00', end: '11:00', status: 'pending' },
  { room: 'CE08403', title: 'ธนพร [67025044]', start: '08:00', end: '09:00', status: 'busy' },
  { room: 'CE08403', title: 'ธนพร [67025044]', start: '11:00', end: '13:00', status: 'pending' },
  { room: 'CE08405', title: 'ธนพร [67025044]', start: '08:00', end: '09:00', status: 'free' },
])

// แปลงเวลาเป็น “คอลัมน์” และความกว้าง (col-span) ของ grid
// 1 ช่อง = 30 นาที (ละเอียดครึ่งชั่วโมง)
const slotMinutes = 30
const colsCount = computed(() => ((endHour - startHour) * 60) / slotMinutes)

function parseHM(s) {
  const [h, m] = s.split(':').map(Number)
  return { h, m }
}
function minutesFromStart(h, m) {
  return (h - startHour) * 60 + m
}
function toGridCol(timeStr) {
  const { h, m } = parseHM(timeStr)
  const mins = minutesFromStart(h, m)
  // +1 เพราะ grid-column เริ่มที่ 1
  return Math.floor(mins / slotMinutes) + 1
}
function colSpan(startStr, endStr) {
  const s = parseHM(startStr), e = parseHM(endStr)
  const mins = minutesFromStart(e.h, e.m) - minutesFromStart(s.h, s.m)
  return Math.max(1, Math.ceil(mins / slotMinutes))
}

// จัดสีตามสถานะ
function statusClass(st) {
  switch (st) {
    case 'free': return 'ev-free'        // เขียวอ่อน
    case 'busy': return 'ev-busy'        // ดำ
    case 'pending': return 'ev-pending'  // ส้มอ่อน
    default: return ''
  }
}
</script>

<template>
  <section class="wrap">

    <!-- หัวข้อ -->
    <div class="section-title">
      <span class="bar"></span>
      <h2>จองห้อง <span class="hl">Study Room</span></h2>
    </div>

    <!-- แถบวันที่ + ปุ่ม + legend -->
    <div class="toolbar">
      <div class="date">02 January 2025</div>

      <div class="legend">
        <span class="dot dot-free"></span> ว่าง
        <span class="dot dot-busy"></span> กำลังใช้งาน
        <span class="dot dot-pending"></span> รออนุมัติ
        <span class="dot dot-deny"></span> ปฏิเสธ
      </div>

      <button class="primary">จองห้องประชุมนี้</button>
    </div>

    <!-- ตาราง (หัวเวลา) -->
    <div class="grid-head" :style="{ gridTemplateColumns: `240px repeat(${colsCount}, 1fr)` }">
      <div class="corner"></div>
      <div v-for="h in hours" :key="h" class="head-hour">
        {{ String(h).padStart(2,'0') }}:00
      </div>
    </div>

    <!-- ตาราง body -->
    <div class="grid-body">
      <div
        v-for="room in rooms"
        :key="room"
        class="row"
        :style="{ gridTemplateColumns: `240px repeat(${colsCount}, 1fr)` }"
      >
        <!-- เซลล์ชื่อห้อง (คอลัมน์ซ้าย) -->
        <div class="room">{{ room }}</div>

        <!-- เส้นแบ็คกราวด์ช่องเวลา -->
        <template v-for="c in colsCount" :key="c">
          <div class="cell"></div>
        </template>

        <!-- อีเวนต์ของห้องนั้น -->
        <template v-for="ev in events.filter(e => e.room === room)" :key="ev.title + ev.start">
          <div
            class="event"
            :class="statusClass(ev.status)"
            :style="{
              gridColumn: `${toGridCol(ev.start)+1} / span ${colSpan(ev.start, ev.end)}`,
            }"
          >
            <div class="ev-title">{{ ev.title }}</div>
            <div class="ev-time">{{ ev.start }} - {{ ev.end }}</div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* layout */
.wrap { max-width: 1200px; margin: 16px auto 48px; padding: 0 16px; }

/* section title */
.section-title { display:flex; align-items:center; gap:12px; margin: 8px 0 12px; }
.section-title .bar { width:4px; height:28px; background:#6366f1; border-radius:2px; }
.section-title h2 { margin:0; font-size:28px; color:#374151; font-weight:800; }
.section-title .hl { color:#4f46e5; }

/* toolbar */
.toolbar { display:flex; align-items:center; gap:16px; justify-content:space-between; margin: 8px 0 12px; }
.date { font-weight:700; font-size:20px; }
.legend { display:flex; align-items:center; gap:16px; font-size:14px; color:#4b5563; }
.dot { width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:6px; }
.dot-free{ background:#bbf7d0; }
.dot-busy{ background:#111827; }
.dot-pending{ background:#fde68a; }
.dot-deny{ background:#fecaca; }
.primary{ background:#2563eb; color:#fff; border:none; border-radius:8px; padding:10px 14px; cursor:pointer; }

/* grid head */
.grid-head {
  display: grid;
  align-items: center;
  border:1px solid #d1d5db;
  border-bottom:none;
  border-radius:12px 12px 0 0;
  overflow:hidden;
  background:#fff;
}
.grid-head .corner { background:#fff; height:40px; display:flex; align-items:center; padding-left:12px; border-right:1px solid #e5e7eb; }
.grid-head .head-hour {
  height:40px; display:flex; align-items:center; justify-content:center;
  font-weight:700; border-left:1px solid #e5e7eb; background:#fafafa;
}

/* grid body */
.grid-body {
  border:1px solid #d1d5db;
  border-radius:0 0 12px 12px;
  overflow:auto;
  max-height: 520px;      /* เลื่อนภายในได้เหมือนภาพตัวอย่าง */
}
.row {
  display: grid;
  position:relative;
  min-height:64px;
  border-top:1px solid #e5e7eb;
}
.row:first-child { border-top:none; }
.room {
  display:flex; align-items:center; justify-content:flex-start;
  padding:0 12px; font-weight:600; color:#374151; background:#fff;
  border-right:1px solid #e5e7eb;
}
.cell { border-left:1px solid #e5e7eb; background: #ffffff; }

/* event bar */
.event {
  position:relative;
  height:40px;
  margin-top:8px;
  align-self:flex-start;
  border-radius:6px;
  display:flex; flex-direction:column; justify-content:center; gap:2px;
  padding:6px 10px;
  overflow:hidden;
  border:1px solid rgba(0,0,0,.08);
}
.ev-title { font-size:12px; font-weight:700; }
.ev-time { font-size:12px; opacity:.9; }

/* สีตามสถานะ */
.ev-free   { background:#d1fae5; }   /* เขียวอ่อน */
.ev-busy   { background:#111827; color:#fff; }
.ev-pending{ background:#fde68a; }

/* ปรับตัวหนังสือหัวบนภาพให้ใหญ่ขึ้น/สวย (ถ้าอยากใช้ร่วมกับ Hero) */
</style>
