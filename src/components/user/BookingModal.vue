<!-- src/components/user/BookingModal.vue -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import api from '@/plugins/axios'   // ✅ ใช้ axios ที่ผูก baseURL/Authorization ไว้

// ======= auth / owner =======
const auth = useAuthStore()
const ownerId = computed(() => (auth?.studentId || '').trim())  // รหัสนิสิตของคนล็อกอิน

// ======= state หลัก =======
const open = defineModel('open', { type: Boolean, default: false })
const loading = ref(false)
const errorMsg = ref('')

// ======= master data =======
const roomTypes = ref([]) // [{id,type_name}]
const rooms = ref([])     // [{id,room_code,type_id,type_name}]

const selectedTypeId = ref(null)
const filteredRooms = computed(() => {
  if (!selectedTypeId.value) return []
  return rooms.value.filter(r => r.type_id === selectedTypeId.value)
})
const selectedRoomCode = ref('')

// ========= เวลา (ชั่วโมงตรงเท่านั้น) =========
const startAt = ref('')   // 'HH:MM'
const endAt   = ref('')   // 'HH:MM'
const date = ref(new Date().toISOString().slice(0,10)) // yyyy-mm-dd วันนี้

// 08:00..16:00 เป็นชั่วโมงตรง
const hourOptions = computed(() => {
  const a = []
  for (let h = 8; h <= 16; h++) a.push(`${String(h).padStart(2,'0')}:00`)
  return a
})
// start เลือกได้ 08:00..15:00 (ต้องมี end อย่างน้อย +1 ชม.)
const startOptions = computed(() => hourOptions.value.filter(t => t < '16:00'))
// end เลือกได้ตั้งแต่ start+1h ถึง min(start+2h, 16:00)
const endOptions = computed(() => {
  if (!startAt.value) return []
  const [h] = startAt.value.split(':').map(Number)
  const e1 = `${String(Math.min(h+1,16)).padStart(2,'0')}:00`
  const e2 = `${String(Math.min(h+2,16)).padStart(2,'0')}:00`
  return hourOptions.value.filter(t => t >= e1 && t <= e2)
})
watch(startAt, () => {
  if (endAt.value && !endOptions.value.includes(endAt.value)) endAt.value = ''
})

// ========= จำนวนผู้ใช้ และรหัสนิสิต =========
// memberCount = จำนวนสมาชิกทั้งหมด "รวมเจ้าของด้วย"
const memberCount = ref(5) // default 5
const othersNeeded = computed(() => Math.max(0, Number(memberCount.value || 0) - 1))

// อาร์เรย์ “สมาชิกคนอื่น ๆ” ไม่รวมเจ้าของ
const otherIds = ref([])

// ✅ ซิงค์จำนวนช่องสมาชิกคนอื่น ๆ ให้เท่ากับ memberCount - 1
function syncOtherIds() {
  const need = othersNeeded.value
  while (otherIds.value.length < need) otherIds.value.push('')
  while (otherIds.value.length > need) otherIds.value.pop()
}

// เรียกซิงค์เมื่อเปลี่ยนจำนวนสมาชิก
watch(memberCount, syncOtherIds)

function sanitizeId(s) {
  return String(s || '').replace(/\s+/g, '').trim()
}
function isValidStudentId(id) {
  // ปรับรูปแบบตามจริงได้ ที่นี่กำหนด 8–10 หลักเป็นตัวเลข
  return /^\d{8,10}$/.test(id)
}

// ========= โหลด master data =========
async function fetchRoomTypes() {
  const { data } = await api.get('/room-types')         // GET /api/room-types
  roomTypes.value = data
}
async function fetchRoomsByType() {
  if (!selectedTypeId.value) { rooms.value = []; return }
  const { data } = await api.get(`/rooms`, { params: { typeId: selectedTypeId.value } }) // GET /api/rooms?typeId=...
  rooms.value = data
}

// reset เมื่อเปิดโมดัล
function resetForm() {
  errorMsg.value = ''
  selectedTypeId.value = null
  selectedRoomCode.value = ''
  startAt.value = ''
  endAt.value = ''

  memberCount.value = 5          // ตั้งค่าเริ่ม
  otherIds.value = []            // เคลียร์ช่อง
  syncOtherIds()                 // ✅ ทำให้ขึ้น 4 ช่องทันที (เพราะรวมเจ้าของแล้วเป็น 5)
}

watch(open, async (v) => {
  if (!v) return
  try {
    resetForm()
    if (!roomTypes.value.length) await fetchRoomTypes()
  } catch (e) {
    errorMsg.value = e?.message || 'โหลดข้อมูลไม่สำเร็จ'
  }
})
watch(selectedTypeId, async () => {
  selectedRoomCode.value = ''
  try {
    await fetchRoomsByType()
  } catch (e) {
    errorMsg.value = e?.message || 'โหลดห้องไม่สำเร็จ'
  }
})

// ========= ส่งจอง =========
async function submit() {
  try {
    errorMsg.value = ''

    if (!ownerId.value) {
      throw new Error('ไม่พบรหัสนิสิตของผู้ใช้ กรุณาออกจากระบบและล็อกอินใหม่')
    }
    if (!selectedTypeId.value) throw new Error('กรุณาเลือกประเภทห้อง')
    if (!selectedRoomCode.value) throw new Error('กรุณาเลือกห้อง')
    if (!startAt.value || !endAt.value) throw new Error('กรุณาเลือกเวลาเริ่ม/สิ้นสุด')

    // รวม owner + สมาชิกคนอื่น ๆ
    const raw = [ownerId.value, ...otherIds.value]
    const cleaned = raw.map(sanitizeId)

    // ตรวจช่องว่าง
    if (cleaned.some((v) => !v)) {
      throw new Error('กรุณากรอกรหัสนิสิตให้ครบตามจำนวนผู้ใช้')
    }

    // ตรวจรูปแบบ
    const bad = cleaned.find(id => !isValidStudentId(id))
    if (bad) throw new Error(`รูปแบบรหัสนิสิตไม่ถูกต้อง: ${bad}`)

    // ตรวจซ้ำ และจำนวนต้องตรงกับ memberCount
    const unique = Array.from(new Set(cleaned))
    if (unique.length !== Number(memberCount.value)) {
      throw new Error('พบรหัสซ้ำกัน หรือจำนวนสมาชิกไม่ครบตามที่เลือก')
    }

    // ✅ ให้ตรงกับ backend: routes/bookings.js ({ roomCode, startAt, endAt, members })
    const payload = {
      roomCode: selectedRoomCode.value,
      startAt: `${date.value} ${startAt.value}:00`,
      endAt:   `${date.value} ${endAt.value}:00`,
      members: unique               // รวมเจ้าของแล้ว
    }

    loading.value = true
    await api.post('/bookings', payload)   // POST /api/bookings (มี token จาก axios interceptor)

    open.value = false
    alert('จองสำเร็จ')
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || 'สร้างการจองไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // เปิดหน้าแล้วจะยังไม่ยิง; รอเปิด modal ค่อยโหลด room-types
})
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
        <select v-model="selectedRoomCode" :disabled="!selectedTypeId">
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
            <option v-for="t in startOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label>เวลาสิ้นสุดการจอง *</label>
          <select v-model="endAt" :disabled="!startAt">
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
        <small>จำนวนนี้ “รวมเจ้าของผู้จอง ({{ ownerId || '—' }})” แล้ว</small>
      </div>

      <!-- Owner (disabled) -->
      <div class="members">
        <label>รหัสนิสิต (เจ้าของผู้จอง)</label>
        <input :value="ownerId" disabled class="owner-input" />
      </div>

      <!-- Others -->
      <div class="members">
        <label>รหัสนิสิต (สมาชิกคนอื่น ๆ)</label>
        <div v-for="(v, i) in otherIds" :key="i" class="member-row">
          <input v-model="otherIds[i]" placeholder="เช่น 67012345" inputmode="numeric" />
        </div>
        <small>ต้องกรอกสมาชิกคนอื่น ๆ {{ othersNeeded }} คน</small>
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
.overlay{ position: fixed; inset:0; background: rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; z-index:50; }
.modal{ width: 520px; max-height: 85vh; overflow:auto; background:#fff; border-radius:16px; padding:20px 24px; box-shadow:0 10px 30px rgba(0,0,0,.2); }
.title{ font-size:22px; font-weight:800; margin-bottom:14px }
.field{ margin-bottom:12px; display:flex; flex-direction:column; gap:6px }
.grid2{ display:grid; grid-template-columns:1fr 1fr; gap:12px }
.members{ display:flex; flex-direction:column; gap:6px; margin:8px 0 }
.member-row input, .owner-input{ width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; background:#fff }
.owner-input[disabled]{ background:#f8fafc; color:#334155 }
select, input{ padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px }
.actions{ display:flex; justify-content:space-between; gap:12px; margin-top:16px }
.btn{ padding:10px 14px; border-radius:10px; border:none; cursor:pointer; font-weight:700 }
.cancel{ background:#f3f4f6 }
.ok{ background:#22c55e; color:white }
.error{ color:#ef4444; font-weight:600; margin-top:6px }
</style>
