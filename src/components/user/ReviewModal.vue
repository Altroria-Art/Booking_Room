<script setup>
import { ref } from 'vue'
import { createReview } from '@/services/api'

const props = defineProps({
  open: { type: Boolean, default: false },  // v-model:open
  roomId: { type: Number, default: null },  // ถ้าจะผูกกับห้อง
  createdBy: { type: String, default: '' }  // ส่งรหัส นศ. มาจาก parent
})
const emit = defineEmits(['update:open', 'submitted'])

const rating  = ref(5)
const comment = ref('')
const loading = ref(false)

function closeModal() {
  if (!loading.value) emit('update:open', false)
}

async function submitReview() {
  const r = Number(rating.value)
  const c = String(comment.value || '').trim()
  if (!Number.isInteger(r) || r < 1 || r > 5) return alert('กรุณาให้คะแนน 1–5 ดาว')
  if (!c) return alert('กรุณากรอกความคิดเห็น')

  const created_by = props.createdBy?.trim() || '67000000' // ปรับเป็นค่า auth จริงในระบบของคุณ
  const payload = { rating: r, comment: c, created_by, room_id: props.roomId ?? null }

  try {
    loading.value = true
    const { data } = await createReview(payload)
    emit('submitted', data)     // ส่งแถวใหม่กลับไปให้ parent แทรกทันที
    rating.value = 5; comment.value = ''
    emit('update:open', false)
  } catch (err) {
    alert(err?.response?.data?.message || 'ส่งรีวิวไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="open" class="modal-overlay">
    <div class="modal-content">
      <h2>เขียนรีวิว</h2>

      <label>ให้คะแนน (1–5 ดาว)</label>
      <select v-model.number="rating" :disabled="loading">
        <option v-for="n in 5" :key="n" :value="n">{{ n }} ★</option>
      </select>

      <label>ความคิดเห็น</label>
      <textarea v-model="comment" rows="4" :disabled="loading" placeholder="พิมพ์ความคิดเห็น..."></textarea>

      <div class="modal-actions">
        <button @click="submitReview" :disabled="loading">
          {{ loading ? 'กำลังส่ง...' : 'ส่งรีวิว' }}
        </button>
        <button class="cancel" @click="closeModal" :disabled="loading">ยกเลิก</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;justify-content:center;align-items:center;z-index:50}
.modal-content{background:#fff;padding:20px;max-width:420px;width:100%;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2)}
textarea,select{width:100%;margin-bottom:15px}
.modal-actions{display:flex;gap:8px;justify-content:flex-end}
.cancel{background:#999;color:#fff;padding:8px 12px;border-radius:6px}
button{padding:8px 12px;border-radius:6px;border:1px solid #ddd}
button:not(.cancel){background:#2563eb;color:#fff;border-color:#2563eb}
button[disabled]{opacity:.6;cursor:not-allowed}
</style>
