<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// ======= state หลัก =======
const open = defineModel('open', { type: Boolean, default: false })   // v-model:open จากพาเรนต์
const loading = ref(false)
const errorMsg = ref('')

// ดึง master data
const roomTypes = ref([]) // [{id,type_name}]
const rooms = ref([])     // [{id,room_code,type_name}]
const filteredRooms = computed(() => {
  if (!selectedTypeId.value) return []
  return rooms.value.filter(r => r.type_id === selectedTypeId.value)
})

const selectedTypeId = ref(null)
const selectedRoomCode = ref('')

// เวลา (step 30 นาที)
const startAt = ref('')
const endAt = ref('')
const date = ref(new Date().toISOString().slice(0,10)) // yyyy-mm-dd วันนี้

// จำนวนผู้ใช้ และรหัสนิสิต
const memberCount = ref(5) // default 5
const memberIds = ref(Array.from({length: 5}, () => ''))

watch(memberCount, (n) => {
  const cur = memberIds.value.length
  if (n > cur) {
    for (let i=0; i<n-cur; i++) memberIds.value.push('')
  } else if (n < cur) {
    memberIds.value.splice(n)
  }
})

// จำกัด end ≤ start + 120 นาที
watch(startAt, () => {
  if (!startAt.value || !endAt.value) return
  if (minutesDiff(startAt.value, endAt.value) > 120) {
    endAt.value = addMinutes(startAt.value, 120)
  }
})
watch(endAt, () => {
  if (!startAt.value || !endAt.value) return
  if (minutesDiff(startAt.value, endAt.value) > 120) {
    endAt.value = addMinutes(startAt.value, 120)
  }
})

// สร้างตัวเลือกเวลา 08:00–16:00 (step 30)
const timeOptions = computed(() => {
  const list = []
  for (let h=8; h<=16; h++) {
    for (let m of [0,30]) {
      const hh = String(h).padStart(2,'0')
      const mm = String(m).padStart(2,'0')
      const t = `${hh}:${mm}`
      list.push(t)
    }
  }
  // เอา 16:30 ออก (เกิน) เหลือถึง 16:00
  return list.filter(t => t <= '16:00')
})

// จำกัด end ให้ไม่เกิน 16:00 และ ≥ start
const endOptions = computed(() => {
  if (!startAt.value) return []
  const out = []
  for (const t of timeOptions.value) {
    if (t > startAt.value) {
      if (minutesDiff(startAt.value, t) <= 120) out.push(t)
    }
  }
  return out
})

function minutesDiff(t1, t2) {
  const [h1,m1] = t1.split(':').map(Number)
  const [h2,m2] = t2.split(':').map(Number)
  return (h2*60+m2) - (h1*60+m1)
}
function addMinutes(t, add) {
  const [h,m] = t.split(':').map(Number)
  const tot = h*60 + m + add
  const nh = Math.floor(tot/60), nm = tot%60
  return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`
}

// โหลด room types/rooms
async function fetchMasters() {
  const [rt, rs] = await Promise.all([
    fetch('/api/room-types').then(r=>r.json()),
    fetch('/api/rooms').then(r=>r.json())
  ])
  roomTypes.value = rt
  rooms.value = rs   // expect {id, room_code, type_id, type_name}
}

// reset เมื่อเปิด/ปิด
watch(open, (v) => {
  if (v) {
    errorMsg.value = ''
    if (!roomTypes.value.length) fetchMasters()
  }
})

// ส่งจอง
async function submit() {
  try {
    errorMsg.value = ''
    if (!selectedTypeId.value) throw new Error('กรุณาเลือกประเภทห้อง')
    if (!selectedRoomCode.value) throw new Error('กรุณาเลือกห้อง')
    if (!startAt.value || !endAt.value) throw new Error('กรุณาเลือกเวลาเริ่ม/สิ้นสุด')

    // ตรวจ memberIds ต้องกรอกครบและเป็นตัวเลข 5–10 ช่อง
    const list = memberIds.value.map(s => (s||'').trim()).filter(Boolean)
    if (list.length !== memberCount.value) throw new Error('กรุณากรอกรหัสนิสิตให้ครบตามจำนวนผู้ใช้')

    const payload = {
      room_code: selectedRoomCode.value,
      start_at: `${date.value} ${startAt.value}:00`,
      end_at:   `${date.value} ${endAt.value}:00`,
      created_by: list[0],  // ถือว่าคนแรกเป็นผู้สร้าง
      members: list
    }

    loading.value = true
    const r = await fetch('/api/bookings', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    const body = await r.json().catch(()=> ({}))
    if (!r.ok) throw new Error(body.error || 'สร้างการจองไม่สำเร็จ')

    // success
    open.value = false
    alert('จองสำเร็จ')
  } catch (e) {
    errorMsg.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchMasters)
</script>

<template>
  <div v-if="open" class="overlay" @click.self="open=false">
    <div class="modal">
      <h2 class="title">จองห้อง STUDYROOM</h2>

      <div class="field">
        <label>กรุณาเลือกประเภทห้อง *</label>
        <select v-model.number="selectedTypeId">
          <option :value="null">กรุณาเลือกประเภทห้อง</option>
          <option v-for="t in roomTypes" :key="t.id" :value="t.id">{{ t.type_name }}</option>
        </select>
      </div>

      <div class="field">
        <label>กรุณาเลือกห้อง *</label>
        <select v-model="selectedRoomCode">
          <option value="">กรุณาเลือกห้อง</option>
          <option v-for="r in filteredRooms" :key="r.id" :value="r.room_code">
            {{ r.room_code }}
          </option>
        </select>
      </div>

      <div class="field grid2">
        <div>
          <label>เวลาเริ่มต้นการจอง *</label>
          <select v-model="startAt">
            <option value="">กรุณาเลือกเวลา</option>
            <option v-for="t in timeOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label>เวลาสิ้นสุดการจอง *</label>
          <select v-model="endAt">
            <option value="">กรุณาเลือกเวลา</option>
            <option v-for="t in endOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>จำนวนผู้เข้าใช้ห้อง (ขั้นต่ำ 5 สูงสุด 10) *</label>
        <select v-model.number="memberCount">
          <option v-for="n in [5,6,7,8,9,10]" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <div class="members">
        <label>กรอกรหัสนิสิต *</label>
        <div v-for="(sid, i) in memberIds" :key="i" class="member-row">
          <input v-model="memberIds[i]" placeholder="เช่น 67012345" />
        </div>
      </div>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <div class="actions">
        <button class="btn cancel" @click="open=false" :disabled="loading">ยกเลิกการจอง</button>
        <button class="btn ok" @click="submit" :disabled="loading">ยืนยันการจอง</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay{
  position: fixed; inset:0; background: rgba(0,0,0,.35);
  display:flex; align-items:center; justify-content:center; z-index:50;
}
.modal{
  width: 520px; max-height: 85vh; overflow:auto;
  background:#fff; border-radius:16px; padding:20px 24px; box-shadow:0 10px 30px rgba(0,0,0,.2);
}
.title{ font-size:22px; font-weight:800; margin-bottom:14px }
.field{ margin-bottom:12px; display:flex; flex-direction:column; gap:6px }
.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:12px }
.members{ display:flex; flex-direction:column; gap:6px; margin:8px 0 }
.member-row input{ width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px }
select, input{ padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px }
.actions{ display:flex; justify-content:space-between; gap:12px; margin-top:16px }
.btn{ padding:10px 14px; border-radius:10px; border:none; cursor:pointer; font-weight:700 }
.cancel{ background:#f3f4f6 }
.ok{ background:#22c55e; color:white }
.error{ color:#ef4444; font-weight:600; margin-top:6px }
</style>
