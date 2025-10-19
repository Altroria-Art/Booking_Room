<!-- src/modules/user/pages/Rooms.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import ReviewRoom from '@/components/user/ReviewRoom.vue'
import BookingModal from '@/components/user/BookingModal.vue'

/* ✅ โหมดฝังในหน้าแอดมิน: ถ้า true จะซ่อน ReviewRoom */
const { adminMode } = withDefaults(defineProps<{ adminMode?: boolean }>(), {
  adminMode: false
})

/* ✅ อีเวนต์สำหรับหน้าแอดมิน */
const emit = defineEmits<{
  (e: 'admin-add'): void
  (e: 'admin-edit'): void
  (e: 'admin-open-cancel', bookingId: number): void
}>()

const auth = useAuthStore()
const showBooking = ref(false)

/* ===== เวลา ===== */
const START_HOUR        = 8
const BUSINESS_END_HOUR = 16
const DISPLAY_END_HOUR  = 17
const HOUR_WIDTH        = 140 // px ต่อ 1 ชั่วโมง

const DISPLAY_INTERVALS = DISPLAY_END_HOUR - START_HOUR
const CANVAS_COLS       = DISPLAY_INTERVALS + 1
const CANVAS_W          = computed(() => CANVAS_COLS * HOUR_WIDTH)

/* ===== จำกัดจำนวนห้องที่มองเห็นทีละ 10 แถว (ที่เหลือเลื่อนลง) ===== */
const ROW_HEIGHT    = 56
const HEADER_HEIGHT = 56
const VISIBLE_ROOMS = 10
const SCHEDULE_H    = computed(() => HEADER_HEIGHT + ROW_HEIGHT * VISIBLE_ROOMS)

const centerLabels = computed(() => {
  const list: { text: string; left: number }[] = []
  for (let i = 0; i < CANVAS_COLS; i++) {
    const h = START_HOUR + i
    list.push({ text: `${String(h).padStart(2,'0')}:00`, left: (i + 0.5) * HOUR_WIDTH })
  }
  return list
})

/* ===== ดึงข้อมูล ===== */
type Room = { id:number; room_code:string; room_type_id:number }
type Booking = {
  id:number; room_id:number; room_code:string;
  start_at?:string; end_at?:string;
  start_hhmm?:string; end_hhmm?:string;
  created_by:string; display_name?:string;
}

function todayLocalYMD(){
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const rooms = ref<Room[]>([])
const bookings = ref<Booking[]>([])

/* ✅ สถานะ: ผู้ใช้มีการจองวันนี้แล้วหรือยัง */
const hasBookingToday = ref(false)
const myBooking = ref<Booking | null>(null)

function recomputeMine() {
  const sid = String(auth.studentId || auth.user?.student_id || '')
  if (!sid) { hasBookingToday.value = false; myBooking.value = null; return }
  const mine = bookings.value.find(b => String(b.created_by) === sid) || null
  hasBookingToday.value = !!mine
  myBooking.value = mine
}

let midnightTimer: number | null = null

async function loadData(){
  const ymd = todayLocalYMD()
  const bust = Date.now()
  const [r1, r2] = await Promise.all([
    fetch('/api/rooms', { cache: 'no-store' }).then(r=>r.json()),
    fetch(`/api/bookings?date=${ymd}&_=${bust}`, { cache: 'no-store' }).then(r=>r.json()),
  ])
  rooms.value = r1
  bookings.value = r2
  recomputeMine()
}

function scheduleMidnightReload(){
  if (midnightTimer) window.clearTimeout(midnightTimer)
  const now  = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0) // 00:01
  midnightTimer = window.setTimeout(async () => {
    await loadData()
    scheduleMidnightReload()
  }, next.getTime() - now.getTime())
}

onMounted(async () => {
  await loadData()
  scheduleMidnightReload()
})
watch(() => auth.studentId, recomputeMine)

/* ===== คำนวณบล็อกจอง ===== */
type Block = { id:number; label:string; left:number; right:number }

function hhmmToHour(s?: string) {
  if (!s) return NaN
  const m = s.match(/^(\d{1,2}):(\d{2})/)
  if (m) return Number(m[1]) + Number(m[2])/60
  return NaN
}
function dateToHour(s?: string) {
  if (!s) return NaN
  const d = new Date(s)
  return d.getHours() + d.getMinutes()/60
}
function toHourFloat(hhmm?: string, dt?: string) {
  const a = hhmmToHour(hhmm)
  if (!Number.isNaN(a)) return a
  return dateToHour(dt)
}

const blocksByRoomId = computed<Record<number, Block[]>>(() => {
  const map: Record<number, Block[]> = {}
  for (const b of bookings.value) {
    const sHraw = toHourFloat(b.start_hhmm, b.start_at)
    const eHraw = toHourFloat(b.end_hhmm,   b.end_at)
    if (Number.isNaN(sHraw) || Number.isNaN(eHraw)) continue

    // 1) จำกัดตามเวลาจริง 08..16
    let vStart = Math.max(START_HOUR, sHraw)
    const vEndData = Math.min(BUSINESS_END_HOUR, eHraw)
    if (vEndData <= START_HOUR || vStart >= BUSINESS_END_HOUR) continue

    // 2) ยืดภาพ: ชั่วโมงถัดไป / หรือ 16:00 → 17:00
    const eps = 1e-6
    const isOnHour = Math.abs(vEndData - Math.round(vEndData)) < eps
    let vEndVisual = vEndData
    if (isOnHour && vEndData < BUSINESS_END_HOUR) {
      vEndVisual = vEndData + 1
    } else if (Math.abs(vEndData - BUSINESS_END_HOUR) < eps) {
      vEndVisual = DISPLAY_END_HOUR
    }

    // 3) พิกัดพิกเซลบนแคนวาส 08..17
    const leftEdgePx  = (vStart     - START_HOUR) * HOUR_WIDTH
    const rightEdgePx = (vEndVisual - START_HOUR) * HOUR_WIDTH
    const left  = Math.max(0, Math.round(leftEdgePx))
    const right = Math.max(0, Math.round(CANVAS_W.value - rightEdgePx))

    const who = b.display_name ? `${b.display_name} ` : ''
    const hh = (x:number)=>`${String(Math.floor(x)).padStart(2,'0')}:${String(Math.round((x%1)*60)).padStart(2,'0')}`
    const label = `${who}[${b.created_by}]  ${hh(sHraw)} - ${hh(eHraw)}`
    ;(map[b.room_id] ||= []).push({ id:b.id, label, left, right })
  }
  return map
})

/* ===== หนีบการเลื่อนไม่ให้เห็น 17:00 (แนวนอน) ===== */
const scheduleRef = ref<HTMLDivElement | null>(null)
function clampScrollRight() {
  const el = scheduleRef.value
  if (!el) return
  const maxAllowed = Math.max(0, el.scrollWidth - el.clientWidth - HOUR_WIDTH)
  if (el.scrollLeft > maxAllowed) el.scrollLeft = maxAllowed
}
onMounted(() => {
  const el = scheduleRef.value
  if (!el) return
  el.addEventListener('scroll', clampScrollRight, { passive: true })
  window.addEventListener('resize', clampScrollRight)
  requestAnimationFrame(clampScrollRight)
})
onUnmounted(() => {
  const el = scheduleRef.value
  if (el) el.removeEventListener('scroll', clampScrollRight)
  window.removeEventListener('resize', clampScrollRight)
  if (midnightTimer) window.clearTimeout(midnightTimer)
})

/* ✅ reload หลังจองสำเร็จ */
async function handleBooked() {
  await loadData()
}

/* ปุ่มจอง (ผู้ใช้) */
function onClickBook() {
  if (hasBookingToday.value) {
    window.alert('วันนี้คุณได้ทำการจองห้องไปแล้ว\nหากต้องการจองใหม่ โปรดยกเลิกการจองปัจจุบันก่อน')
    return
  }
  showBooking.value = true
}

/* ✅ คลิกบล็อกจอง: โหมดแอดมินให้ยิงอีเวนต์ขึ้นไป (รับ id ตรง ๆ) */
function onBookingClick(bookingId: number) {
  if (adminMode && typeof bookingId === 'number') {
    emit('admin-open-cancel', bookingId)
  }
}
</script>

<template>
  <div class="page rooms">
    <header class="page-title">
      <span class="th">จองห้อง</span>
      <span class="en">Study Room</span>
    </header>

    <div class="date-row">
      <div class="today">
        {{ new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'long',year:'numeric'}).format(new Date()) }}
      </div>

      <div class="date-actions">
        <template v-if="adminMode">
          <button type="button" class="btn-admin add"  @click="emit('admin-add')">
            เพิ่มห้อง <span class="pill">+</span>
          </button>
          <button type="button" class="btn-admin edit" @click="emit('admin-edit')">
            แก้ไขห้อง <span class="pill">+</span>
          </button>
        </template>

        <button type="button" class="btn-book" @click="onClickBook">
          <span>จองห้องประชุมที่นี่</span>
          <svg class="btn-icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="#FFFFFF"/>
            <path d="M24 16v16M16 24h16" stroke="#1F49FF" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ตาราง -->
    <div class="schedule" ref="scheduleRef" :style="{ maxHeight: SCHEDULE_H + 'px' }">
      <!-- HEADER -->
      <div class="row header">
        <div class="cell room-col"></div>
        <div class="cell hours-bar" :style="{ width: CANVAS_W + 'px' }">
          <div v-for="(it, i) in centerLabels"
               :key="i"
               class="hlabel"
               :style="{ left: it.left + 'px' }">
            {{ it.text }}
          </div>
          <div class="edge edge-left"></div>
          <div class="edge edge-right" :style="{ left: ((DISPLAY_INTERVALS) * HOUR_WIDTH) + 'px' }"></div>
        </div>
      </div>

      <!-- แถวห้อง -->
      <div class="row" v-for="r in rooms" :key="r.id">
        <div class="cell room-col room-code">{{ r.room_code }}</div>

        <!-- แผงเวลา -->
        <div class="cell time-grid" :style="{ width: CANVAS_W + 'px' }">
          <div v-for="i in (DISPLAY_INTERVALS + 1)"
               :key="'vl'+i"
               class="vline-abs"
               :style="{ left: ((i-1) * HOUR_WIDTH) + 'px' }" />

          <!-- บล็อกจอง -->
          <div v-for="b in (blocksByRoomId[r.id] || [])"
               :key="b.id"
               class="booking"
               :data-booking-id="b.id"
               @click.stop="onBookingClick(b.id)"
               :style="{ left: b.left + 'px', right: b.right + 'px' }"
               :title="b.label">
            <span class="b-title">{{ b.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <BookingModal v-model:open="showBooking" @success="handleBooked" />
    <ReviewRoom v-if="!adminMode" />
  </div>
</template>

<style scoped>
/* layout */
.rooms{ max-width:1200px; margin:0 auto; padding:0 20px 80px; }
.page-title{ position:relative; display:inline-flex; align-items:baseline; gap:.5rem; padding-left:14px; margin:8px 0 12px; }
.page-title::before{ content:''; position:absolute; left:0; top:2px; bottom:-4px; width:4px; border-radius:2px; background:#5b6acf; }
.page-title .th,.page-title .en{ line-height:1.16; font-size:1.55rem; }
.page-title .th{ font-weight:400; color:#374151; letter-spacing:.1px; }
.page-title .en{ font-weight:700; color:#1f2937; }

.date-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 0 14px; border-bottom:1px solid #e5e7eb; }
.today{ font-size:1.25rem; font-weight:700; color:#111827; }

/* กลุ่มปุ่มด้านขวา */
.date-actions{ display:flex; align-items:center; gap:10px; }

/* ปุ่มของแอดมิน */
.btn-admin{
  display:inline-flex; align-items:center; gap:.5rem;
  font:700 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans Thai',sans-serif;
  border:0; color:#111; padding:8px 12px; border-radius:10px;
  box-shadow:0 4px 12px rgba(0,0,0,.12); cursor:pointer;
  transition:filter .15s ease, transform .05s ease;
}
.btn-admin:hover{ filter:brightness(0.98); }
.btn-admin:active{ transform:translateY(1px); }
.btn-admin.add{  background:#7dfc90; }
.btn-admin.edit{ background:#ffe169; }
.btn-admin .pill{
  display:inline-grid; place-items:center; width:18px; height:18px;
  border-radius:50%; background:#111; color:#fff; font-weight:900; line-height:1;
}

/* ปุ่มจอง */
.btn-book{
  display:inline-flex; align-items:center; gap:10px;
  background:#1F49FF; color:#fff; padding:8px 14px; border:0; border-radius:10px;
  font:600 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans Thai',sans-serif;
  box-shadow:0 4px 12px rgba(0,0,0,.12); cursor:pointer;
  transition:filter .15s ease, transform .05s ease;
}
.btn-book:hover{ filter:brightness(1.08); }
.btn-book:active{ transform:translateY(1px); }
.btn-book:focus-visible{ outline:none; box-shadow:0 0 0 3px #fff, 0 0 0 6px rgba(31,73,255,.6); }
.btn-icon{ width:22px; height:22px; flex:0 0 auto; }

/* ตาราง */
.schedule{
  margin-top:14px; border:1px solid #e5e7eb; border-radius:10px; overflow:auto;
}

/* โครง */
.row{
  display:grid; grid-template-columns:160px 1fr; min-height:56px;
  border-top:1px solid #f3f4f6; position:relative;
}
.row.header{ position:sticky; top:0; z-index:2; background:#fff; border-top:0; }

/* เซลล์ */
.cell{ padding:10px; }
.room-col{ background:#fafafa; border-right:1px solid #f0f0f0; }
.room-code{ font-weight:600; color:#374151; }

/* hours-bar / time-grid ไม่มี padding */
.cell.hours-bar, .cell.time-grid{ padding:0 !important; }

/* หัวตาราง */
.hours-bar{ position:relative; height:56px; overflow:visible; }
.hlabel{
  position:absolute; top:10px; transform:translateX(-50%);
  font-weight:600; color:#111827; pointer-events:none;
}
.edge{ position:absolute; top:0; bottom:0; border-left:1px dashed #e5e7eb; }
.edge-left{ left:0; }

/* แผงเวลา */
.time-grid{ position:relative; display:block; height:56px; overflow:hidden; }

/* เส้นชั่วโมง */
.vline-abs{
  position:absolute; top:0; bottom:0;
  border-left:1px dashed #e5e7eb; pointer-events:none; z-index:0;
}

/* บล็อกจอง */
.booking{
  position:absolute; top:8px; bottom:8px; box-sizing:border-box;
  border-radius:10px; border:1px solid #9ee0cf; background:#C4F1E5;
  display:flex; align-items:center; padding:0 10px; box-shadow:0 4px 10px rgba(0,0,0,.06);
  overflow:hidden; white-space:nowrap; text-overflow:ellipsis; z-index:1; cursor:pointer;
}
.booking .b-title{ font-size:12px; font-weight:600; color:#0f5132; }
</style>
