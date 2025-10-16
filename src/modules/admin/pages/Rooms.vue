<script setup>
import { ref } from 'vue'
import EditRoomModal from '@/components/admin/EditRoomModal.vue'

const showEdit = ref(false)

// ถ้าคุณมีฟังก์ชันโหลดรายการห้องอยู่แล้ว ให้เรียกหลังแก้ไข/ลบเสร็จ
const loadRooms = () => {
  // ... โค้ดโหลดห้องเดิมของคุณ
}
</script>

<template>
  <section class="p-6">
    <h1 class="text-2xl font-bold mb-4">จองห้อง (แอดมิน)</h1>
    <!-- TODO: ใส่ตาราง/ฟอร์มจองห้องของแอดมิน หรือรีใช้ของ user ชั่วคราว -->
    <!-- <UserRooms admin-mode /> -->
  </section>
  <div class="toolbar">
    <button class="edit-btn" @click="showEdit = true">
      แก้ไขห้อง
      <span class="pill">+</span>
    </button>
  </div>

  <!-- รายการห้องของเดิมคุณ -->

  <EditRoomModal
    v-model:open="showEdit"
    @updated="loadRooms"
    @deleted="loadRooms"
  />
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 16px 0 8px;
}
.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-weight: 700;
  border: none;
  background: #ffe169;          /* เหลืองนุ่มแบบภาพ */
  color: #111;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
}
.edit-btn:hover { filter: brightness(0.98); }
.pill {
  display: inline-grid;
  place-items: center;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  font-weight: 900;
  line-height: 1;
}
</style>

