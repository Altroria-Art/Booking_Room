<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'              // ✅ เพิ่มบรรทัดนี้
import { useAuthStore } from '@/store/auth'
import { fetchMyBooking, cancelBooking } from '@/services/api'

const router = useRouter()                           // ✅ เพิ่มบรรทัดนี้
const HOME_PATH = '/user/rooms'                      // ✅ เปลี่ยนเป็น '/' ได้ตามต้องการ

const props = defineProps({
  open: { type: Boolean, default: false },
  date: { type: String, default: '' },
  roomCode: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'close'])

const auth = useAuthStore()

const loading = ref(false)
const notFound = ref(false)
const booking = ref(null)

const dateStr = computed(() =>
  props.date && /^\d{4}-\d{2}-\d{2}$/.test(props.date)
    ? props.date
    : new Date().toISOString().slice(0, 10)
)

const close = () => {
  emit('update:open', false)
  emit('close')
}

const load = async () => {
  if (!auth.isLoggedIn) {
    notFound.value = true
    booking.value = null
    return
  }
  loading.value = true
  notFound.value = false
  booking.value = null
  try {
    const { data } = await fetchMyBooking({
      date: dateStr.value,
      ...(props.roomCode ? { roomCode: props.roomCode } : {})
    })
    const rec = data?.data ?? data ?? null
    if (!rec || !rec.id) notFound.value = true
    else booking.value = rec
  } catch (e) {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, dateStr.value, props.roomCode],
  ([isOpen]) => { if (isOpen) load() }
)

async function onCancelBooking() {                    // ✅ แก้ฟังก์ชันนี้
  if (!booking.value || loading.value) return
  if (!confirm('ยืนยันยกเลิกการจอง?')) return
  loading.value = true
  try {
    await cancelBooking(booking.value.id)
    // ปิดโมดัลก่อน
    emit('update:open', false)
    emit('close')
    // นำทางไปหน้าแรก
    await router.push(HOME_PATH)
    // รีเฟรชทั้งหน้าให้ state/timetable เคลียร์แน่นอน
    window.location.reload()
  } catch (e) {
    alert('ยกเลิกไม่สำเร็จ: ' + (e?.response?.data?.error || e.message))
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <div v-if="props.open" class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <div v-if="loading" class="center">กำลังโหลด...</div>

      <!-- แบบที่ 1: วันนี้ยังไม่มีการจอง -->
      <div v-else-if="notFound" class="content">
        <div class="icon x">✕</div>
        <h2 class="title">หลักฐานการจองห้องสมุด</h2>
        <p class="subtitle">วันนี้คุณยังไม่มีการจอง</p>
        <div class="actions">
          <button class="btn confirm" @click="close">ยืนยัน</button>
        </div>
      </div>

      <!-- แบบที่ 2: มีการจองของวันนั้น -->
      <div v-else class="content">
        <div class="icon check">✓</div>
        <h2 class="title">หลักฐานการจองห้องสมุด</h2>
        <p class="subtitle">การจองเสร็จสิ้น ({{ dateStr }})</p>

        <div class="block">
          <strong>ห้องที่ทำการจอง :</strong> {{ booking.room_code }}
        </div>

        <div class="block">
          <strong>เวลา :</strong>
          {{ booking.start_hhmm || (booking.start_at ? new Date(booking.start_at).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) : '') }}
          -
          {{ booking.end_hhmm || (booking.end_at ? new Date(booking.end_at).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}) : '') }}
        </div>

        <div class="block">
          <strong>ชื่อผู้จอง</strong><br>
          ชื่อ : {{ auth.displayName }} &nbsp; รหัสนิสิต : {{ auth.studentId }}
        </div>

        <div class="block" v-if="booking.members?.length">
          <strong>รหัสนิสิตผู้ร่วมจอง</strong>
          <div v-for="(sid, i) in booking.members" :key="sid">
            รหัสนิสิตคนที่ {{ i + 1 }} : {{ sid }}
          </div>
        </div>

        <div class="actions">
          <button class="btn danger" @click="onCancelBooking">ยกเลิกการจอง</button>
          <button class="btn confirm" @click="close">ยืนยัน</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: grid; place-items: center; z-index: 50;
}
.modal-card {
  width: min(560px, 92vw);
  background: #e9eef7;     /* โทนใกล้ภาพตัวอย่าง */
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
}
.center { text-align: center; padding: 40px 0; }

.content { text-align: center; }
.title { font-size: 22px; font-weight: 800; margin: 6px 0 0; }
.subtitle { font-size: 18px; margin: 2px 0 18px; }

.icon {
  width: 64px; height: 64px; border-radius: 50%;
  display: inline-grid; place-items: center;
  font-size: 34px; margin-bottom: 8px;
  border: 4px solid transparent;
}
.icon.check { color: #16a34a; border-color: #16a34a; }
.icon.x { color: #ef4444; border-color: #ef4444; }

.block { text-align: left; margin: 12px 0; }

.actions {
  display: flex; gap: 12px; justify-content: center; margin-top: 18px;
}
.btn {
  border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer;
  font-weight: 700;
}
.btn.confirm { background: #86efac; color: #111; }
.btn.danger { background: #ef4444; color: #fff; }
</style>
