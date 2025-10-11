<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { fetchRooms, fetchBookingsOfDay } from '../services/api'

// props: วันที่ (YYYY-MM-DD)
const props = defineProps({
  date: { type: String, required: true }
})

const START_HOUR = 8
const END_HOUR = 16
const SLOT_MIN = 30
const slotsPerHour = 60 / SLOT_MIN

const rooms = ref([])
const bookings = ref([]) // ทั้งหมดของวันนั้น
const loading = ref(false)
const error = ref('')

const hours = computed(() => {
  const a = []
  for (let h = START_HOUR; h <= END_HOUR; h++) a.push(h)
  return a
})

const timelineSlots = computed(() => (END_HOUR - START_HOUR) * slotsPerHour)

function parseISO(x) { return new Date(x) }

// ปรับตำแหน่งและความกว้างของ block บนกริด (0..timelineSlots)
function bookingToBlock(b) {
  const s = parseISO(b.start_at)
  const e = parseISO(b.end_at)

  // clamp ให้อยู่ในกรอบ 08:00–16:00
  const base = new Date(props.date + 'T00:00:00')
  const startClamp = new Date(base)
  startClamp.setHours(START_HOUR, 0, 0, 0)
  const endClamp = new Date(base)
  endClamp.setHours(END_HOUR, 0, 0, 0)

  const ss = Math.max(s.getTime(), startClamp.getTime())
  const ee = Math.min(e.getTime(), endClamp.getTime())
  const durMin = Math.max(0, (ee - ss) / 60000)

  const offsetMin = (ss - startClamp) / 60000
  const left = Math.max(0, offsetMin / SLOT_MIN)
  const width = Math.max(0, durMin / SLOT_MIN)

  return { left, width }
}

const roomsWithBookings = computed(() => {
  const map = new Map()
  rooms.value.forEach(r => map.set(r.id, { ...r, items: [] }))
  bookings.value.forEach(b => {
    const r = map.get(b.room_id)
    if (r) r.items.push({ ...b, block: bookingToBlock(b) })
  })
  return Array.from(map.values())
})

async function load() {
  try {
    loading.value = true
    error.value = ''
    const [r1, r2] = await Promise.all([
      fetchRooms(),
      fetchBookingsOfDay(props.date),
    ])
    rooms.value = r1.data
    bookings.value = r2.data
  } catch (e) {
    error.value = e?.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.date, load)
</script>

<template>
  <div>
    <div v-if="loading">กำลังโหลด...</div>
    <div v-else-if="error" style="color:crimson">เกิดข้อผิดพลาด: {{ error }}</div>

    <div v-else class="schedule">

        <div class="grid header">
            <div class="room-col"></div>
            <div class="time-cols">
        
                <div v-for="(h, i) in hours.slice(0, -1)" :key="i" class="time-col">
                    {{ String(h).padStart(2,'0') }}:00
                </div>

        
                <div class="time-end-label">
                    {{ String(END_HOUR).padStart(2,'0') }}:00
                </div>
            </div>
        </div>


      <!-- แถวห้อง + time-grid -->
      <div v-for="r in roomsWithBookings" :key="r.id" class="grid row">
        <div class="room-col">{{ r.code || r.name }}</div>
        <div class="time-cols slot-grid">
          <!-- เส้นแบ่งช่อง -->
          <div
            v-for="i in (END_HOUR - START_HOUR) * slotsPerHour"
            :key="i"
            class="slot-cell"
          ></div>

          <!-- บล็อกการจอง -->
          <div
            v-for="b in r.items"
            :key="b.id"
            class="booking"
            :style="{
              left: `calc(${b.block.left} * var(--slot-w))`,
              width: `calc(${b.block.width} * var(--slot-w))`,
            }"
            :title="`${b.user_name ?? ''} ${new Date(b.start_at).toLocaleTimeString()} - ${new Date(b.end_at).toLocaleTimeString()}`"
          >
            <div class="bk-title">
              {{ b.user_name ?? b.user_email ?? ('UID:'+b.user_id) }}
            </div>
            <div class="bk-time">
              {{ new Date(b.start_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }}
              -
              {{ new Date(b.end_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.time-cols { 
  position: relative; 
  grid-template-columns: repeat(16, var(--slot-w)); 
}

.time-end-label {
  position: absolute;
  top: 8px;
  right: -28px; /* ขยับให้ตรงกับท้ายกริด */
  font-weight: 600;
}

.schedule {
  --slot-w: 120px; /* ความกว้างช่องละ 30 นาที */
  --row-h: 64px;
  --border: #ddd;
}

.grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  border-bottom: 1px solid var(--border);
}

.header { font-weight: 600; }

.room-col {
  padding: 8px 12px;
  border-right: 1px solid var(--border);
  background: #fafafa;
  white-space: nowrap;
}

.time-cols {
  display: grid;
  grid-template-columns: repeat(16, var(--slot-w)); /* 8 ชม x 2 ช่อง/ชม = 16 */
}

.time-col {
  text-align: center;
  padding: 8px 0;
  border-right: 1px solid var(--border);
}

.row .time-cols {
  position: relative;
  height: var(--row-h);
}

.slot-grid .slot-cell {
  border-right: 1px solid var(--border);
}

.booking {
  position: absolute;
  top: 8px;
  height: calc(var(--row-h) - 16px);
  background: #c7f7df;
  border: 1px solid #7bd3a6;
  border-radius: 8px;
  padding: 6px 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: auto;
}

.booking .bk-title { font-weight: 600; font-size: 12px; }

.booking .bk-time { font-size: 12px; opacity: 0.8; }
</style>
