<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'


const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['update:open'])

const rating = ref(5)
const comment = ref('')

const closeModal = () => {
  emit('update:open', false)
}

const submitReview = () => {
  alert('รีวิวถูกส่งแล้ว! (สามารถเชื่อม backend ทีหลัง)')
  emit('update:open', false)
}
</script>

<template>
  <div v-if="open" class="modal-overlay">
    <div class="modal-content">
      <h2>เขียนรีวิว</h2>

      <label>ให้คะแนน (1-5 ดาว)</label>
      <select v-model="rating">
        <option v-for="n in 5" :value="n" :key="n">{{ n }} ★</option>
      </select>

      <label>ความคิดเห็น</label>
      <textarea v-model="comment" rows="4"></textarea>

      <div class="modal-actions">
        <button @click="submitReview">ส่งรีวิว</button>
        <button class="cancel" @click="closeModal">ยกเลิก</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  max-width: 400px;
  width: 100%;
  border-radius: 8px;
}

textarea, select {
  width: 100%;
  margin-bottom: 15px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.cancel {
  background: #999;
}
</style>
