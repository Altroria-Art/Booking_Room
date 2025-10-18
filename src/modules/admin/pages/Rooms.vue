<!-- src/modules/admin/pages/Rooms.vue -->
<script setup>
import { ref } from 'vue'
import EditRoomModal from '@/components/admin/EditRoomModal.vue'
import AddRoomModal  from '@/components/admin/AddRoomModal.vue'

/* ✅ ใช้หน้า Rooms ของฝั่ง User แล้วส่ง event กลับมาเปิดโมดัล */
import UserRooms from '@/modules/user/pages/Rooms.vue'

const showEdit = ref(false)
const showAdd  = ref(false)

/* ถ้ามีฟังก์ชันโหลดรายการห้อง ให้เรียกหลังสร้าง/อัปเดต/ลบ */
const loadRooms = () => {
  // ... โค้ดโหลดห้องเดิมของคุณ (ถ้ามี)
}
</script>

<template>
  <section class="p-6">

    <!-- ✅ ฝังหน้า User และดักอีเวนต์จากปุ่มที่อยู่ข้างๆ ปุ่มจอง -->
    <div class="admin-embed">
      <UserRooms
        :admin-mode="true"
        @admin-add="showAdd = true"
        @admin-edit="showEdit = true"
      />
    </div>
  </section>

  <!-- โมดัลเพิ่ม/แก้ไขห้อง -->
  <AddRoomModal
    v-model:open="showAdd"
    @created="loadRooms"
  />
  <EditRoomModal
    v-model:open="showEdit"
    @updated="loadRooms"
    @deleted="loadRooms"
  />
</template>

<style scoped>
/* ปุ่มของแอดมินถูกสไตล์อยู่ใน src/modules/user/pages/Rooms.vue แล้ว
   ที่นี่เลยเหลือแค่สไตล์โครงหน้าแอดมิน */
.admin-embed { padding-bottom: 64px; }

/* ตัวเลือก: ถ้าต้องการซ่อน header/toolbar ภายในของหน้า User ตอนฝังในแอดมิน */
:deep(.user-rooms__topbar),
:deep(.user-rooms__nav),
:deep(.user-rooms__toolbar) {
  display: none !important;
}
</style>
