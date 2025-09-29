<script setup>
import { computed, ref } from 'vue'

// กำหนดช่วงเวลา (ชั่วโมงเต็ม)
const startHour = 8
const endHour   = 16   // 8.00–16.00

// 1 ช่องเล็ก = 30 นาที
const slotMinutes   = 30
const slotsPerHour  = 60 / slotMinutes      // 2 ช่อง/ชม.
const SLOT_W        = 150                   // px ต่อ 1 ช่องเล็ก (30 นาที)

// จำนวนคอลัมน์ทั้งหมด (ช่องเล็ก)
const colsCount = computed(() => (endHour - startHour) * slotsPerHour)

// ความกว้างรวมของกริด (คอลัมน์ชื่อห้อง 240px + ช่องเล็กทั้งหมด)
// หมายเหตุ: กล่อง .grid-head/.grid-body ใช้ box-sizing:border-box
const INNER_W = computed(() => 240 + colsCount.value * SLOT_W)

// ชั่วโมงสำหรับแสดง label
const hours = computed(() => {
  const a = []
  for (let h = startHour; h <= endHour; h++) a.push(h)
  return a
})

// รายชื่อห้อง
const rooms = ref([
  'CE08401','CE08402','CE08403','CE08404',
  'CE08405','CE08406','CE08407','CE08408',
])

// อีเวนต์ตัวอย่าง
const events = ref([
  { room:'CE08401', title:'ธนพร [67025044]', start:'08:00', end:'09:00', status:'free' },
  { room:'CE08402', title:'ธนพร [67025044]', start:'10:00', end:'11:00', status:'pending' },
  { room:'CE08403', title:'ธนพร [67025044]', start:'08:00', end:'09:00', status:'busy' },
  { room:'CE08403', title:'ธนพร [67025044]', start:'11:00', end:'13:00', status:'pending' },
  { room:'CE08405', title:'ธนพร [67025044]', start:'08:00', end:'09:00', status:'free' },
])

function parseHM(s){ const [h,m] = s.split(':').map(Number); return {h,m} }
function minutesFromStart(h,m){ return (h - startHour) * 60 + m }
function toGridCol(timeStr){
  const {h,m} = parseHM(timeStr)
  const mins = minutesFromStart(h,m)
  return Math.floor(mins / slotMinutes) + 1 // grid เริ่มที่ 1
}
function colSpan(startStr,endStr){
  const s = parseHM(startStr), e = parseHM(endStr)
  const mins = minutesFromStart(e.h,e.m) - minutesFromStart(s.h,s.m)
  return Math.max(1, Math.ceil(mins / slotMinutes))
}
function statusClass(st){
  switch(st){
    case 'free': return 'ev-free'
    case 'busy': return 'ev-busy'
    case 'pending': return 'ev-pending'
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

    <!-- ตัวห่อสกรอลล์ ‘เดียวกัน’ -->
    <div class="scroll-x">
      <!-- หัวเวลา -->
      <div
        class="grid-head"
        :style="{
          width: INNER_W + 'px',
          gridTemplateColumns: `240px repeat(${colsCount}, ${SLOT_W}px)`
        }"
      >
        <div class="corner"></div>
        <div v-for="h in hours" :key="h" class="head-hour">
          {{ String(h).padStart(2,'0') }}:00
        </div>
      </div>

      <!-- ตัวตาราง -->
      <div class="grid-body" :style="{ width: INNER_W + 'px' }">
        <div
          v-for="room in rooms"
          :key="room"
          class="row"
          :style="{ gridTemplateColumns: `240px repeat(${colsCount}, ${SLOT_W}px)` }"
        >
          <!-- คอลัมน์ชื่อห้อง -->
          <div class="room">{{ room }}</div>

          <!-- ช่องเวลา (เส้นพื้นหลัง) -->
          <div v-for="c in colsCount" :key="c" class="cell"></div>

          <!-- อีเวนต์ -->
          <div
            v-for="ev in events.filter(e => e.room === room)"
            :key="ev.title + ev.start"
            class="event"
            :class="statusClass(ev.status)"
            :style="{ gridColumn: `${1 + toGridCol(ev.start)} / span ${colSpan(ev.start, ev.end)}` }"
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
.toolbar { display:flex; align-items:center; gap:16px; justify-content:space-between; margin: 8px 0 12px; }
.date { font-weight:700; font-size:20px; }
.legend { display:flex; align-items:center; gap:16px; font-size:14px; color:#4b5563; }
.dot { width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:6px; }
.dot-free{ background:#bbf7d0; }
.dot-busy{ background:#111827; }
.dot-pending{ background:#fde68a; }
.dot-deny{ background:#fecaca; }
.primary{ background:#2563eb; color:#fff; border:none; border-radius:8px; padding:10px 14px; cursor:pointer; }

/* ตัวห่อที่มีสกรอลล์แนวนอนร่วมกัน */
.scroll-x{
  width:100%;
  overflow-x:auto;            /* เลื่อนซ้าย-ขวาร่วมกัน */
}

/* สำคัญ: ให้ width รวม border/padding ไม่บวกเพิ่ม */
.grid-head,
.grid-body,
.row{
  box-sizing: border-box;
  column-gap: 0;              /* ไม่ให้มีช่องว่างเพิ่ม */
}

/* ให้หัวเวลา “ลอยติดบน” เวลาเลื่อนแนวตั้ง */
.grid-head{
  position: sticky;
  top: 0;
  z-index: 2;                 /* ให้อยู่เหนือ event */
  display:grid;
  border:1px solid #d1d5db;
  border-bottom:none;
  border-radius:12px 12px 0 0;
  background:#fff;
}
.grid-head .corner{ height:40px; border-right:1px solid #e5e7eb; background:#fff; }
.grid-head .head-hour{
  height:40px; display:flex; align-items:center; justify-content:center;
  font-weight:700; border-left:1px solid #e5e7eb; background:#fafafa;
}

/* grid body */
.grid-body{
  border:1px solid #d1d5db;
  border-radius:0 0 12px 12px;
}

/* แถว */
.row{
  display:grid;
  min-height:64px;
  border-top:1px solid #e5e7eb;
}

/* คอลัมน์ชื่อห้อง */
.room{
  background:#fff; border-right:1px solid #e5e7eb;
  display:flex; align-items:center; padding:0 12px; font-weight:600;
}

/* ช่องเวลา (เส้นพื้นหลัง) */
.cell{ border-left:1px solid #f3f4f6; }
.row > .cell:last-child{ border-right:0; } /* กันความกว้างล้นด้านขวา */

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
.ev-time  { font-size:12px; opacity:.9; }

/* สีตามสถานะ */
.ev-free    { background:#d1fae5; }
.ev-busy    { background:#111827; color:#fff; }
.ev-pending { background:#fde68a; }
</style>
