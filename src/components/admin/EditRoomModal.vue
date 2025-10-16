<script setup>
import { ref, reactive, watch } from 'vue'
import api from '@/plugins/axios' // ต้องมีไฟล์นี้ตามที่เราตั้งค่าไปก่อนหน้า

const props = defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'updated', 'deleted'])

const rooms = ref([])
const roomTypes = ref([])

const form = reactive({
  roomId: '',
  room_code: '',
  room_type_id: ''
})
const loading = ref(false)

const close = () => emit('update:open', false)

const fetchData = async () => {
  try {
    // ปรับ endpoint ให้ตรง backend ของคุณถ้าไม่ตรง
    const [rRooms, rTypes] = await Promise.all([
      api.get('/rooms'),
      api.get('/room-types')
    ])
    rooms.value = rRooms.data || []
    roomTypes.value = rTypes.data || []
  } catch (e) {
    console.error(e)
  }
}

// เปิดป็อปอัพแล้วค่อยโหลดข้อมูล
watch(() => props.open, (v) => { if (v) fetchData() })

// เมื่อเลือกห้อง ให้ดึงค่าปัจจุบันมา prefill
watch(() => form.roomId, (id) => {
  const r = rooms.value.find(x => String(x.id) === String(id))
  if (r) {
    form.room_code = r.room_code || ''
    form.room_type_id = r.room_type_id || ''
  } else {
    form.room_code = ''
    form.room_type_id = ''
  }
})

const submitUpdate = async () => {
  if (!form.roomId) return alert('กรุณาเลือกห้องที่ต้องการแก้ไข')
  loading.value = true
  try {
    await api.put(`/rooms/${form.roomId}`, {
      room_code: form.room_code,
      room_type_id: form.room_type_id
    })
    emit('updated')
    close()
  } catch (e) {
    console.error(e)
    alert('อัปเดตไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}

const submitDelete = async () => {
  if (!form.roomId) return alert('กรุณาเลือกห้องที่จะลบ')
  if (!confirm('ยืนยันลบห้องนี้หรือไม่?')) return
  loading.value = true
  try {
    await api.delete(`/rooms/${form.roomId}`)
    emit('deleted')
    close()
  } catch (e) {
    console.error(e)
    alert('ลบไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="backdrop" @click.self="close">
      <div class="sheet">
        <header class="head">
          <h2>
            <span class="hl">แก้ไข/ลบห้อง</span><span class="sub">STUDYROOM</span>
          </h2>
        </header>

        <section class="body">
          <!-- เลือกห้อง -->
          <label class="label">กรุณาเลือกห้องที่ต้องการแก้ไข/ลบ <b>*</b></label>
          <select v-model="form.roomId" class="control">
            <option value="" disabled>กรุณาเลือกห้อง</option>
            <option
              v-for="r in rooms"
              :key="r.id"
              :value="r.id"
            >
              {{ r.room_code }}{{ r.group_name ? ` (กลุ่มชั้น ${r.group_name})` : '' }}
            </option>
          </select>

          <!-- เลขห้องใหม่ -->
          <label class="label">กรุณาใส่เลขห้องที่ต้องการเปลี่ยน <b>*</b></label>
          <input
            v-model.trim="form.room_code"
            type="text"
            class="control"
            placeholder="เช่น CE008"
          />

          <!-- ประเภทห้อง -->
          <label class="label">กรุณาเลือกประเภทห้องที่ต้องการเปลี่ยน <b>*</b></label>
          <select v-model="form.room_type_id" class="control">
            <option value="" disabled>กรุณาเลือกห้อง</option>
            <option
              v-for="t in roomTypes"
              :key="t.id"
              :value="t.id"
            >
              {{ t.type_name || t.name }}
            </option>
          </select>
        </section>

        <footer class="foot">
          <button class="btn danger" :disabled="loading" @click="submitDelete">
            ลบห้อง <span class="badge">−</span>
          </button>
          <button class="btn success" :disabled="loading" @click="submitUpdate">
            ยืนยันแก้ไข <span class="badge">＋</span>
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.backdrop{
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: grid; place-items: center; z-index: 1000;
}
.sheet{
  width: min(760px, 92vw);
  background: #dfe4ff;               /* โทนม่วงอ่อนตามภาพ */
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,.35);
  padding: 28px 24px;
}
.head h2{ margin: 0 0 12px; font-weight: 800; font-size: 32px; }
.hl{ margin-right: 4px; }
.sub{ letter-spacing: .5px; font-size: 18px; opacity: .85; }
.body{ display: grid; gap: 10px; }
.label{ font-weight: 600; margin-top: 6px; }
.control{
  width: 100%; padding: 10px 12px; border-radius: 10px;
  border: 1px solid #cbd5e1; background: #fff;
}
.foot{
  margin-top: 18px; display: flex; gap: 16px; justify-content: center;
}
.btn{
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px; border: none; border-radius: 12px;
  font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 16px rgba(0,0,0,.12);
}
.btn:disabled{ opacity: .6; cursor: not-allowed; }
.badge{
  display: inline-grid; place-items: center;
  width: 18px; height: 18px; border-radius: 50%; background: #111; color: #fff; font-weight: 900;
}
.danger{ background: #ff9b9b; color: #111; }
.success{ background: #94f0b5; color: #111; }
</style>
