<!-- src/components/user/BookingProofModal.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import { fetchMyLatestBooking, cancelBooking } from '@/services/api'

const props = defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'close'])

const loading = ref(false)
const notFound = ref(false)   // ยังไม่เคยจอง
const booking = ref(null)     // มีการจองล่าสุด
const auth = useAuthStore()

const close = () => {
  emit('update:open', false)
  emit('close')
}

watch(() => props.open, async (val) => {
  if (!val) return
  loading.value = true
  notFound.value = false
  booking.value = null
  try {
    const { data } = await fetchMyLatestBooking()
    if (!data || !data.id) {
      notFound.value = true
    } else {
      booking.value = data           // { id, room_code, start_at, end_at, members: [] }
    }
  } catch (e) {
    // ถ้า error (เช่น 404) ให้ถือว่าไม่พบการจอง
    notFound.value = true
  } finally {
    loading.value = false
  }
})

async function onCancelBooking() {
  if (!booking.value) return
  if (!confirm('ยืนยันยกเลิกการจอง?')) return
  try {
    await cancelBooking(booking.value.id)
    // หลังยกเลิกสำเร็จ ให้แสดง modal แบบ "ยังไม่ได้จอง"
    booking.value = null
    notFound.value = true
    alert('ยกเลิกการจองสำเร็จ')
  } catch (e) {
    alert('ยกเลิกไม่สำเร็จ: ' + (e?.response?.data?.error || e.message))
  }
}
</script>

<template>
  <div v-if="props.open" class="modal-backdrop" @click.self="close">
    <div class="modal-card">
      <div v-if="loading" class="center">กำลังโหลด...</div>

      <!-- แบบที่ 1: ยังไม่เคยจอง -->
      <div v-else-if="notFound" class="content">
        <div class="icon x">✕</div>
        <h2 class="title">หลักฐานการจองห้องสมุด</h2>
        <p class="subtitle">ยังไม่ได้จอง</p>

        <div class="actions">
          <button class="btn confirm" @click="close">ยืนยัน</button>
        </div>
      </div>

      <!-- แบบที่ 2: เคยจองแล้ว -->
      <div v-else class="content">
        <div class="icon check">✓</div>
        <h2 class="title">หลักฐานการจองห้องสมุด</h2>
        <p class="subtitle">การจองเสร็จสิ้น</p>

        <div class="block">
          <strong>ห้องที่ทำการจอง :</strong> {{ booking.room_code }}
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
