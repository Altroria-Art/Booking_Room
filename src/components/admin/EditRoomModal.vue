<script setup>
import { ref, reactive, watch, computed } from 'vue'
import api from '@/plugins/axios'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit  = defineEmits(['update:open', 'updated', 'deleted'])

const rooms = ref([])       // [{ id, room_code, room_type_id, type_name }]
const roomTypes = ref([])   // [{ id, type_name }]

const form = reactive({
  roomId: '',
  room_code: '',
  room_type_id: ''
})

const loadingUpdate = ref(false)
const loadingDelete = ref(false)

function resetForm () {
  form.roomId = ''
  form.room_code = ''
  form.room_type_id = ''
}

const close = () => { resetForm(); emit('update:open', false) }

// โหลดรายการห้อง/ประเภท
const fetchData = async () => {
  try {
    const [rRooms, rTypes] = await Promise.all([
      api.get('/rooms'),
      api.get('/room-types')
    ])
    rooms.value = Array.isArray(rRooms.data) ? rRooms.data : []
    roomTypes.value = Array.isArray(rTypes.data) ? rTypes.data : []
  } catch (e) {
    console.error(e)
    alert('โหลดข้อมูลห้องไม่สำเร็จ')
  }
}

/* ✅ เปิดป็อปอัป → รีเซ็ตก่อน แล้วค่อยโหลดข้อมูล */
watch(() => props.open, (v) => { if (v) { resetForm(); fetchData() } })

// เลือกห้องแล้ว prefill (เพื่อ “แก้ไข” เท่านั้น)
watch(() => form.roomId, (id) => {
  const r = rooms.value.find(x => String(x.id) === String(id))
  if (r) {
    form.room_code    = r.room_code ?? ''
    form.room_type_id = r.room_type_id ?? null
  } else {
    form.room_code = ''
    form.room_type_id = null
  }
})

// ปุ่มกด: เงื่อนไขเปิด/ปิด
const canDelete = computed(() => form.roomId !== '')
const canUpdate = computed(() =>
  form.roomId !== '' &&
  !!form.room_code?.trim() &&
  form.room_type_id !== ''
)

// —— แก้ไขห้อง —— 
const submitUpdate = async () => {
  if (!canUpdate.value) return alert('กรุณาเลือกห้อง และกรอกเลขห้อง/ประเภทให้ครบ')
  const id = Number(form.roomId)                         // 👈 แปลงเป็นตัวเลข
  const typeId = Number(form.room_type_id)

  if (Number.isNaN(id) || Number.isNaN(typeId)) {
    return alert('ข้อมูลไม่ถูกต้อง')
  }

  loadingUpdate.value = true
  try {
    await api.put(`/rooms/${id}`, {                      // 👈 ใช้ id ที่เป็นตัวเลข
      room_code: form.room_code.trim(),
      room_type_id: typeId
    })
    emit('updated')
    close()
  } catch (e) {
    console.error(e)
    const msg = e?.response?.data?.message || e.message
    alert('อัปเดตไม่สำเร็จ: ' + msg)
  } finally {
    loadingUpdate.value = false
  }
}

// —— ลบห้อง (ไม่สนช่อง 2–3) —— 
const submitDelete = async () => {
  if (!canDelete.value) return alert('กรุณาเลือกห้องที่จะลบ')
  if (!confirm('ยืนยันลบห้องนี้หรือไม่?')) return

  const id = Number(form.roomId)                         // 👈 แปลงเป็นตัวเลข
  if (Number.isNaN(id)) return alert('ข้อมูลไม่ถูกต้อง')

  loadingDelete.value = true
  try {
    await api.delete(`/rooms/${id}`)                     // 👈 ใช้ id ที่เป็นตัวเลข
    emit('deleted')
    close()
  } catch (e) {
    console.error(e)
    const msg = e?.response?.data?.message || e.message
    alert('ลบไม่สำเร็จ: ' + msg)
  } finally {
    loadingDelete.value = false
  }
}
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="backdrop" @click.self="close">
      <div class="sheet">
        <header class="head">
          <h2><span class="hl">แก้ไข/ลบห้อง</span><span class="sub">STUDYROOM</span></h2>
        </header>

        <section class="body">
          <!-- ช่องที่ 1: ใช้ทั้งลบ/แก้ไข -->
          <label class="label">กรุณาเลือกห้องที่ต้องการแก้ไข/ลบ <b>*</b></label>
          <select v-model="form.roomId" class="control">
            <option value="">กรุณาเลือกห้อง</option>
            <option v-for="r in rooms" :key="r.id" :value="String(r.id)">
              {{ r.room_code }} — {{ r.type_name }}
            </option>
          </select>

          <!-- ช่องที่ 2–3: ใช้เฉพาะตอน “แก้ไข” (ไม่มี required เพื่อไม่บล็อกปุ่มลบ) -->
          <label class="label">กรุณาใส่เลขห้องที่ต้องการเปลี่ยน <b>*</b></label>
          <input
            v-model.trim="form.room_code"
            type="text"
            class="control"
            placeholder="เช่น CE008"
          />

          <label class="label">กรุณาเลือกประเภทห้องที่ต้องการเปลี่ยน <b>*</b></label>
          <select v-model="form.room_type_id" class="control">
            <option value="" disabled>กรุณาเลือกห้อง</option>
            <option v-for="t in roomTypes" :key="t.id" :value="t.id">
              {{ t.type_name || t.name }}
            </option>
          </select>
        </section>

        <footer class="foot">
          <!-- ❗ ปุ่มลบเป็น type="button" และไม่พึ่งช่อง 2–3 -->
          <button
            type="button"
            class="btn danger"
            :disabled="!canDelete || loadingDelete"
            @click="submitDelete"
          >
            ลบห้อง <span class="badge">−</span>
          </button>

          <button
            type="button"
            class="btn success"
            :disabled="!canUpdate || loadingUpdate"
            @click="submitUpdate"
          >
            ยืนยันแก้ไข <span class="badge">＋</span>
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.backdrop{ position: fixed; inset:0; background: rgba(0,0,0,.45); display:grid; place-items:center; z-index:1000; }
.sheet{ width:min(760px,92vw); background:#dfe4ff; border-radius:24px; box-shadow:0 20px 50px rgba(0,0,0,.35); padding:28px 24px; }
.head h2{ margin:0 0 12px; font-weight:800; font-size:32px; }
.hl{ margin-right:4px; }
.sub{ letter-spacing:.5px; font-size:18px; opacity:.85; }
.body{ display:grid; gap:10px; }
.label{ font-weight:600; margin-top:6px; }
.control{ width:100%; padding:10px 12px; border-radius:10px; border:1px solid #cbd5e1; background:#fff; }
.foot{ margin-top:18px; display:flex; gap:16px; justify-content:center; }
.btn{ display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border:none; border-radius:12px; font-weight:700; cursor:pointer; box-shadow:0 6px 16px rgba(0,0,0,.12); }
.btn:disabled{ opacity:.6; cursor:not-allowed; }
.badge{ display:inline-grid; place-items:center; width:18px; height:18px; border-radius:50%; background:#111; color:#fff; font-weight:900; }
.danger{ background:#ff9b9b; color:#111; }
.success{ background:#94f0b5; color:#111; }
</style>
