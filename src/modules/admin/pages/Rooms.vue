<!-- src/modules/admin/pages/Rooms.vue -->
<script setup>
import { ref } from 'vue'
import EditRoomModal from '@/components/admin/EditRoomModal.vue'
import AddRoomModal  from '@/components/admin/AddRoomModal.vue'

/* ✅ ดึง "หน้า Rooms ของฝั่ง User" มาใช้ซ้ำ */
import UserRooms from '@/modules/user/pages/Rooms.vue'

const showEdit = ref(false)
const showAdd  = ref(false)

/* ถ้าคุณมีฟังก์ชันโหลดรายการห้องอยู่แล้ว ให้เรียกหลังแก้ไข/ลบเสร็จ */
const loadRooms = () => {
  // ... โค้ดโหลดห้องเดิมของคุณ (ถ้ามี)
}
</script>

<template>
  <section class="p-6">
    <h1 class="text-2xl font-bold mb-4">จองห้อง (ผู้ดูแลระบบ)</h1>

    <!-- แถบเครื่องมือของแอดมิน -->
    <div class="toolbar">
      <button class="add-btn"  @click="showAdd = true">
        เพิ่มห้อง <span class="pill">+</span>
      </button>
      <button class="edit-btn" @click="showEdit = true">
        แก้ไขห้อง <span class="pill">+</span>
      </button>
    </div>

    <!-- ✅ ใช้ตารางจองห้องของฝั่งผู้ใช้มาแสดงในหน้าแอดมิน -->
    <div class="admin-embed">
      <UserRooms :admin-mode="true" />
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
.toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 16px 0 12px;
}
.add-btn, .edit-btn{
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-weight: 700;
  border: none;
  color: #111;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
}
.add-btn{  background: #7dfc90; }
.edit-btn{ background: #ffe169; }
.add-btn:hover, .edit-btn:hover { filter: brightness(0.98); }

.pill {
  display: inline-grid;
  place-items: center;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #111; color: #fff;
  font-weight: 900; line-height: 1;
}

/* (ตัวเลือก) ถ้าหน้า User มี header/toolbar อื่นที่อยากซ่อนในหน้าแอดมิน */
:deep(.user-rooms__topbar),
:deep(.user-rooms__nav),
:deep(.user-rooms__toolbar) {
  display: none !important;
}

.admin-embed { padding-bottom: 64px; }
</style>
