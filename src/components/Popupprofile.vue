<template>
  <div v-if="show" class="overlay">
    <div class="popup">
      <div class="icon">👤</div>
      <h2 class="title">STUDYROOM <span class="highlight">UP</span></h2>

      <div class="content">
        <p><strong>ชื่อผู้ใช้</strong></p>
        <p>ชื่อ : {{ user.firstName }} &nbsp; นามสกุล : {{ user.lastName }}</p>
        <p>รหัสนิสิต : {{ user.studentId }}</p>
        <p>เบอร์โทรศัพท์ {{ user.phone }}</p>
      </div>

      <button class="confirm-btn" @click="$emit('close')">ยืนยัน</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  user: Object
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background: #eaf0ff;
  padding: 30px;
  border-radius: 16px;
  width: 350px;
  text-align: center;
}

.icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.highlight {
  color: #6b5bff;
}

.content {
  text-align: left;
  margin-bottom: 20px;
}

.confirm-btn {
  padding: 8px 20px;
  background: #74c69d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>