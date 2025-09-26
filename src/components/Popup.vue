<template>
  <div v-if="show" class="popup-overlay">
    <div class="popup-card">
      <!-- ไอคอน -->
      <div class="icon-container">
        <span v-if="success" class="check-icon">✔</span>
        <span v-else class="cross-icon">✖</span>
      </div>

      <!-- เนื้อหา -->
      <h2>หลักฐานการจองห้องสมุด</h2>
      <p v-if="success" class="status">การจองเสร็จสิ้น</p>
      <p v-else class="status error">ยังไม่ได้จอง</p>

      <!-- รายละเอียด -->
      <div v-if="success" class="details">
        <p><strong>ห้องที่ทำการจอง :</strong> CE08402</p>
        <p><strong>ชื่อผู้จอง :</strong> สมพล หยดย้อย (รหัสนิสิต: 67022928)</p>

        <p><strong>รหัสนิสิตผู้ร่วมจอง</strong></p>
        <p>รหัสนิสิตคนที่ 1 : 67023019</p>
        <p>รหัสนิสิตคนที่ 2 : 67022927</p>
        <p>รหัสนิสิตคนที่ 3 : 67022924</p>
        <p>รหัสนิสิตคนที่ 4 : 67022921</p>
      </div>

      <!-- ปุ่ม -->
      <div class="buttons">
        <button v-if="success" class="cancel" @click="$emit('cancel')">ยกเลิกการจอง</button>
        <button class="confirm" @click="$emit('close')">ยืนยัน</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  success: Boolean
})

defineEmits(['close', 'cancel'])
</script>

<style scoped>
/* พื้นหลังโปร่งใส */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* กล่อง popup */
.popup-card {
  background: #e9f0f6;
  padding: 25px;
  border-radius: 15px;
  width: 400px;
  text-align: left;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.3);
}

h2 {
  text-align: center;
  margin-bottom: 10px;
}

.status {
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
}
.status.error {
  color: red;
}

.icon-container {
  text-align: center;
  font-size: 50px;
  margin-bottom: 10px;
}

.check-icon {
  color: green;
}

.cross-icon {
  color: red;
}

/* ปุ่ม */
.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin: 0 5px;
}

.cancel {
  background: #e74c3c;
  color: white;
}

.confirm {
  background: #2ecc71;
  color: white;
}
</style>
