<script setup>
import { computed, ref } from 'vue'
import CalendarIcon from '../img/Spiral Calendar.svg'

// ---------- ค่าพื้นฐาน ----------
const startHour = 8
const endHour   = 17           // แสดงหัว 08:00 ถึง 16:00
const slotMinutes   = 30
const slotsPerHour  = 60 / slotMinutes   // 2 ช่อง/ชม.
const SLOT_W        = 150                // px ต่อ 1 ช่องเล็ก (30 นาที)

// ชั่วโมงบนหัวตาราง (08:00, 09:00, …, 16:00)
const hours = computed(() => {
  const a = []
  for (let h = startHour; h < endHour; h++) a.push(h)
  return a
})

// จำนวนคอลัมน์เวลาทั้งหมด (หน่วย 30 นาที)
const colsCount = computed(() => (endHour - startHour) * slotsPerHour)

// ความกว้างรวม (240px ชื่อห้อง + ช่องเวลา)
const INNER_W = computed(() => 240 + colsCount.value * SLOT_W)

// รายชื่อห้อง
const rooms = ref([
  'CE08401','CE08402','CE08403','CE08404',
  'CE08405','CE08406','CE08407','CE08408',
])

// อีเวนต์ (รูปแบบเวลา HH:MM ให้ถูกต้อง)
const events = ref([
  { room:'CE08401', title:'สมพล หยดย้อย [67022928]', start:'08:00', end:'10:00', status:'using' },
  { room:'CE08402', title:'ธนพร [67025044]',            start:'10:00', end:'12:00', status:'reserved' },
  { room:'CE08403', title:'ธนพร [67025044]',            start:'08:00', end:'10:00', status:'return' },
  { room:'CE08403', title:'ธนพร [67025044]',            start:'11:00', end:'14:00', status:'reserved' },
  { room:'CE08405', title:'ธนพร [67025044]',            start:'08:00', end:'10:00', status:'using' },
])

// ---------- ฟังก์ชันช่วย ----------
function parseHM(s){
  const [h, m] = s.trim().split(':').map(Number)
  return { h, m }
}
function minutesFromStart(h, m){
  return (h - startHour) * 60 + m
}
// คืน “เส้นกริด” ฐานเริ่มที่ 1 (เฉพาะคอลัมน์เวลา)
function toGridCol(timeStr) {
  const { h, m } = parseHM(timeStr)
  const mins = minutesFromStart(h, m)
  return Math.floor(mins / slotMinutes) + 1   // เส้นกริด base 1
}
const ROOM_COL_OFFSET = 1
const toLine = (t) => ROOM_COL_OFFSET + toGridCol(t)

// สีสถานะ
function statusClass(st){
  switch(st){
    case 'using':    return 'ev-using'
    case 'return':   return 'ev-return'
    case 'reserved': return 'ev-reserved'
    default:         return ''
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

    <!-- วันที่ + legend + ปุ่ม -->
    <div class="toolbar">
      <div class="date">02 January 2025</div>

      <div class="legend">
        <span class="legend-title">
          <img :src="CalendarIcon" alt="สถานะ" class="icon" />
          <span>สีสถานะการจองห้อง</span>
        </span>
        <span class="legend-item"><span class="dot dot-using"></span> กำลังใช้งาน</span>
        <span class="legend-item"><span class="dot dot-reserved"></span> จองห้องแล้ว</span>
        <span class="legend-item"><span class="dot dot-return"></span> คืนห้องช้า</span>
      </div>

      <button class="primary">จองห้องประชุมนี้</button>
    </div>

    <!-- ตัวห่อ scroll แนวนอนร่วมกัน -->
    <div class="scroll-x">
      <!-- หัวเวลา -->
      <div
        class="grid-head"
        :style="{
          width: `calc(${INNER_W}px - 1px)`,
          gridTemplateColumns: `240px repeat(${colsCount}, ${SLOT_W}px)`,
          '--sph': slotsPerHour
        }"
      >
        <div class="corner"></div>
        <div v-for="h in hours" :key="h" class="head-hour">
          {{ String(h).padStart(2,'0') }}:00
        </div>
      </div>

      <!-- ตาราง -->
      <div class="grid-body" :style="{ width: `calc(${INNER_W}px - 1px)` }">
        <div
          v-for="room in rooms"
          :key="room"
          class="row"
          :style="{ gridTemplateColumns: `240px repeat(${colsCount}, ${SLOT_W}px)` }"
        >
          <div class="room">{{ room }}</div>
          <div v-for="c in colsCount" :key="c" class="cell"></div>

          <div
            v-for="ev in events.filter(e => e.room === room)"
            :key="ev.title + ev.start"
            class="event"
            :class="statusClass(ev.status)"
            :style="{
              gridColumn: `${toLine(ev.start)} / ${toLine(ev.end)}`
            }"
          >
            <div class="ev-title">{{ ev.title }}</div>
            <div class="ev-time">{{ ev.start }} - {{ ev.end }}</div>
          </div>
        </div>
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
.toolbar{
  display:flex; align-items:center; gap:16px;
  justify-content:flex-start; margin: 8px 0 16px;
}
.date { font-weight:700; font-size:20px; }

/* legend */
.legend{
  display:flex; align-items:center; gap:20px;
  font-size:14px; color:#000;
  margin-left:auto; margin-right:16px; white-space:nowrap;
}
.legend-title{ display:flex; align-items:center; }
.legend-title .icon{ width:20px; height:20px; margin-right:8px; }
.legend-item{ display:flex; align-items:center; gap:6px; }

.dot{ width:12px; height:12px; border-radius:50%; display:inline-block; }
.dot-using    { background:#bbf7d0; }
.dot-reserved { background:#fcd34d; }
.dot-return   { background:#000000; }

.primary{ background:#2563eb; color:#fff; border:none; border-radius:8px; padding:10px 14px; cursor:pointer; }

/* scroll wrapper */
.scroll-x{ width:100%; overflow-x:auto; }

/* box sizing */
.grid-head, .grid-body, .row{ box-sizing:border-box; column-gap:0; }

/* head */
.grid-head{
  position:sticky; top:0; z-index:2; display:grid;
  border:1px solid #d1d5db; border-bottom:none;
  border-radius:12px 12px 0 0; background:#fff;
}
.grid-head .corner{ height:40px; border-right:1px solid #e5e7eb; background:#fff; }
.grid-head .head-hour{
  height:40px; display:flex; align-items:center; justify-content:center;
  font-weight:700; border-left:1px solid #e5e7eb; background:#fafafa;
  grid-column: span var(--sph, 2); /* 1 ชั่วโมง = 2 ช่อง (30 นาที) */
}

/* body */
.grid-body{ border:1px solid #d1d5db; border-radius:0 0 12px 12px; }

/* row */
.row{
  display:grid; min-height:80px; border-top:1px solid #e5e7eb; align-items:center;
}
.room{
  background:#fff; border-right:1px solid #e5e7eb;
  display:flex; align-items:center; padding:0 12px; font-weight:600;
}
.cell{ border-left:1px solid #f3f4f6; }
.row > .cell:last-child{ border-right:0; }

/* event */
.event{
  position:relative; height:40px; margin:0; align-self:center;
  border-radius:6px; display:flex; flex-direction:column; justify-content:center; gap:2px;
  padding:6px 10px; overflow:hidden; border:1px solid rgba(0,0,0,.08);
}
.ev-title{ font-size:12px; font-weight:700; }
.ev-time{ font-size:12px; opacity:.9; }

.ev-using{ background:#d1fae5; }
.ev-return{ background:#111827; color:#fff; }
.ev-reserved{ background:#fde68a; }
</style>
