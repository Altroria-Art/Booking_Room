<!-- src/modules/admin/pages/Rooms.vue -->
<script setup>
import { ref } from 'vue'
import EditRoomModal from '@/components/admin/EditRoomModal.vue'
import AddRoomModal  from '@/components/admin/AddRoomModal.vue'
import UserRooms from '@/modules/user/pages/Rooms.vue'

/* โมดัลยกเลิกการจอง (แอดมิน) */
import AdminCancelModal from '@/components/admin/AdminCancelModal.vue'
import { getAdminBooking, cancelAdminBooking } from '@/services/api'

const showEdit = ref(false)
const showAdd  = ref(false)

/* รีเฟรช UserRooms โดยไม่แก้โค้ดข้างใน */
const refreshKey = ref(0)
const refreshUserRooms = () => { refreshKey.value++ }

/* ถ้ามีฟังก์ชันโหลดห้องของเดิม เรียกเสร็จแล้วให้รีเฟรช child ด้วย */
const loadRooms = () => {
  // ...โค้ดโหลดห้องเดิมของคุณ (ถ้ามี)
  refreshUserRooms()
}

/* ===== ป๊อปอัพยกเลิกการจอง ===== */
const showCancel = ref(false)
const selected   = ref(null)   // รายละเอียด booking
const cancelling = ref(false)

async function onAdminOpenCancel(bookingId) {
  if (!bookingId) return

  // เปิดโมดัลก่อนให้เห็นว่ากำลังทำงาน
  showCancel.value = true
  selected.value = null

  try {
    // ✅ getAdminBooking() คืน object ข้อมูลโดยตรงแล้ว
    const data = await getAdminBooking(bookingId)
    selected.value = data
  } catch (e) {
    console.error(e)
    alert('ไม่สามารถโหลดข้อมูลการจองได้')
    showCancel.value = false
  }
}

async function onConfirmCancel(id) {
  cancelling.value = true
  try {
    await cancelAdminBooking(id)
    showCancel.value = false
    selected.value = null
    refreshUserRooms()
  } catch (e) {
    console.error(e)
    alert('ยกเลิกการจองไม่สำเร็จ')
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <section class="p-6">
    <div class="admin-embed">
      <UserRooms
        :key="refreshKey"
        :admin-mode="true"
        @admin-add="showAdd = true"
        @admin-edit="showEdit = true"
        @admin-open-cancel="onAdminOpenCancel"
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

  <!-- โมดัลยกเลิกการจอง -->
  <AdminCancelModal
    v-model:open="showCancel"
    :data="selected"
    :loading="cancelling"
    @close="showCancel = false"
    @confirm-cancel="onConfirmCancel"
  />

  <!-- Fallback ระหว่างโหลด -->
  <div v-if="showCancel && !selected" class="fallback-modal">
    <div class="fallback-card">
      <div class="fallback-title">กำลังโหลดข้อมูลการจอง…</div>
      <div class="fallback-sub">โปรดรอสักครู่</div>
    </div>
  </div>
</template>

<style scoped>
.admin-embed { padding-bottom: 64px; }

/* ซ่อน header/toolbar ของหน้า User ตอนฝังในแอดมิน */
:deep(.user-rooms__topbar),
:deep(.user-rooms__nav),
:deep(.user-rooms__toolbar) {
  display: none !important;
}

/* Fallback Modal */
.fallback-modal{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.35);
  display: grid; place-items: center;
  z-index: 9999;
}
.fallback-card{
  min-width: 280px; padding: 16px 20px;
  background: #fff; border-radius: 12px; box-shadow: 0 12px 38px rgba(0,0,0,.22);
}
.fallback-title{ font-weight: 700; margin-bottom: 4px; color: #111827; }
.fallback-sub{ color: #6b7280; font-size: 14px; }
</style>
