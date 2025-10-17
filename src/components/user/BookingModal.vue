<!-- src/components/user/BookingModal.vue -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import api from '@/plugins/axios'

// ======= auth / owner =======
const auth = useAuthStore()
const ownerId = computed(() => (auth?.studentId || '').trim())

// ======= state หลัก =======
const open = defineModel('open', { type: Boolean, default: false })
const loading = ref(false)
const errorMsg = ref('')

// 👉 emit ให้หน้า Rooms รับรู้เมื่อจองเสร็จ
const emit = defineEmits(['success'])

// ======= master data =======
const roomTypes = ref([])
const rooms = ref([])

const selectedTypeId = ref(null)

const filteredRooms = computed(() => {
  const t = Number(selectedTypeId.value)
  if (!t) return []
  return rooms.value.filter(r => Number(r.type_id ?? r.room_type_id) === t)
})

const selectedRoomCode = ref('')

// ========= เวลา =========
// ✅ ใช้วันที่แบบ LOCAL (เลิกใช้ toISOString() ที่เป็น UTC)
function todayLocalYMD () {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const startAt = ref('')   // 'HH:MM'
const endAt   = ref('')   // 'HH:MM'
const date    = ref(todayLocalYMD()) // yyyy-mm-dd วันนี้ (LOCAL)

const hourOptions = computed(() => {
  const a = []
  for (let h = 8; h <= 16; h++) a.push(`${String(h).padStart(2,'0')}:00`)
  return a
})
const startOptions = computed(() => hourOptions.value.filter(t => t < '16:00'))
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

// ========= จำนวนผู้ใช้ =========
const memberCount = ref(5)
const othersNeeded = computed(() => Math.max(0, Number(memberCount.value || 0) - 1))
const otherIds = ref([])

function syncOtherIds () {
  const need = othersNeeded.value
  while (otherIds.value.length < need) otherIds.value.push('')
  while (otherIds.value.length > need) otherIds.value.pop()
}
watch(memberCount, syncOtherIds)

function sanitizeId (s) { return String(s || '').replace(/\s+/g, '').trim() }
function isValidStudentId (id) { return /^\d{8,10}$/.test(id) }

// ========= โหลด master data =========
async function fetchRoomTypes () {
  try {
    const { data } = await api.get('/room-types')
    roomTypes.value = data
  } catch {
    const { data } = await api.get('/rooms/types')
    roomTypes.value = data
  }
}

async function fetchRoomsByType () {
  if (!selectedTypeId.value) { rooms.value = []; return }
  const { data } = await api.get('/rooms', { params: { typeId: selectedTypeId.value } })
  rooms.value = (Array.isArray(data) ? data : []).map(r => ({
    id: r.id,
    room_code: r.room_code,
    type_id: Number(r.type_id ?? r.room_type_id ?? selectedTypeId.value),
    type_name: r.type_name ?? ''
  }))
}

// reset form เมื่อเปิดโมดัล
function resetForm () {
  errorMsg.value = ''
  selectedTypeId.value = null
  selectedRoomCode.value = ''
  startAt.value = ''
  endAt.value = ''
  memberCount.value = 5
  otherIds.value = []
  syncOtherIds()
}

watch(open, async (v) => {
  if (!v) return
  try {
    // ✅ รีเซ็ตวันที่ให้เป็น “วันนี้ตาม local” ทุกครั้งที่เปิด
    date.value = todayLocalYMD()
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
async function submit () {
  try {
    errorMsg.value = ''

    if (!ownerId.value) throw new Error('ไม่พบรหัสนิสิตของผู้ใช้ กรุณาออกจากระบบและล็อกอินใหม่')
    if (!selectedTypeId.value) throw new Error('กรุณาเลือกประเภทห้อง')
    if (!selectedRoomCode.value) throw new Error('กรุณาเลือกห้อง')
    if (!startAt.value || !endAt.value) throw new Error('กรุณาเลือกเวลาเริ่ม/สิ้นสุด')

    // รวม owner + สมาชิกคนอื่น ๆ
    const raw = [ownerId.value, ...otherIds.value]
    const cleaned = raw.map(sanitizeId)

    if (cleaned.some(v => !v)) throw new Error('กรุณากรอกรหัสนิสิตให้ครบตามจำนวนผู้ใช้')
    const bad = cleaned.find(id => !isValidStudentId(id))
    if (bad) throw new Error(`รูปแบบรหัสนิสิตไม่ถูกต้อง: ${bad}`)

    const unique = Array.from(new Set(cleaned))
    if (unique.length !== Number(memberCount.value)) {
      throw new Error('พบรหัสซ้ำกัน หรือจำนวนสมาชิกไม่ครบตามที่เลือก')
    }

    const payload = {
      roomCode: selectedRoomCode.value,
      startAt: `${date.value} ${startAt.value}:00`,
      endAt:   `${date.value} ${endAt.value}:00`,
      members: unique
    }

    loading.value = true
    await api.post('/bookings', payload)

    // แจ้งหน้า Rooms รีโหลด
    emit('success')
    open.value = false
    alert('จองสำเร็จ')
  } catch (e) {
    // แปล error 409 (ชนเวลา) ให้เป็นข้อความอ่านง่าย
    const res = e?.response
    if (res?.status === 409 && Array.isArray(res?.data?.conflicts) && res.data.conflicts.length) {
      const list = res.data.conflicts.map(it => `${it.start_hhmm}–${it.end_hhmm}`).join(', ')
      errorMsg.value = `ช่วงเวลาที่เลือกชนกับการจองเดิม (${list})`
    } else {
      errorMsg.value = res?.data?.message || e?.message || 'สร้างการจองไม่สำเร็จ'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // รอเปิด modal ค่อยโหลด room-types
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
        <select v-model="selectedRoomCode" :disabled="!selectedTypeId || filteredRooms.length === 0">
          <option value="">กรุณาเลือกห้อง</option>
          <option v-for="r in filteredRooms" :key="r.id" :value="r.room_code">
            {{ r.room_code }}
          </option>
        </select>
        <small v-if="selectedTypeId && filteredRooms.length === 0" class="hint">ไม่มีห้องในประเภทนี้</small>
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

      <!-- Owner -->
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
.hint{ color:#6b7280; font-size:12px; margin-top:4px }
</style>
