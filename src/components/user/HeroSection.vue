<!-- src/components/user/HeroSection.vue -->
<template>
  <section class="hero">
    <img class="hero-img" src="/src/img/image 9.svg" alt="hero" />

    <div class="overlay">
      <h2 class="subtitle">
        โปรแกรมจองห้อง ศูนย์บรรณสารและการเรียนรู้ สถาบันนวัตกรรมการเรียนรู้
      </h2>
      <h1 class="title">มหาวิทยาลัยพะเยา</h1>
    </div>

    <!-- Tabs ใต้แบนเนอร์ -->
    <div class="overlay-buttons">
      <RouterLink
        to="/user/rooms"
        class="tab-link"
        :class="{ active: isActive(['/user/rooms', '/rooms', '/']) }"
        >จองห้อง</RouterLink
      >

      <!-- ปุ่มหลักฐานการจอง: ไม่ลิงก์ไหนทั้งนั้น -->
      <button type="button" class="tab-link" @click.stop.prevent="openProof">
        หลักฐานการจอง
      </button>

      <RouterLink
        to="/user/review"
        class="tab-link"
        :class="{ active: isActive(['/user/review', '/review']) }"
        >รีวิว</RouterLink
      >
    </div>

    <!-- Modal (วางนอก overlay-buttons ก็ได้) -->
    <BookingProofModal
      :open="proofOpen"
      @update:open="(v) => (proofOpen = v)"
    />
  </section>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import BookingProofModal from "@/components/user/BookingProofModal.vue"; // แนะนำใช้ path แบบ alias

const route = useRoute();

// true ถ้า path ตรง หรือเป็นเส้นทางย่อยของ target (เช่น /user/review/123)
const isActive = (target) => {
  const paths = Array.isArray(target) ? target : [target];
  return paths.some((p) => route.path === p || route.path.startsWith(p + "/"));
};

// ✅ state + function สำหรับเปิด/ปิด modal
const proofOpen = ref(false);
const openProof = () => {
  // console.log('openProof clicked') // debug ได้
  proofOpen.value = true;
};
</script>

<style scoped>
.hero {
  position: relative;
  max-width: 1384px;
  aspect-ratio: 1384 / 572;
  margin: 20px auto;
  overflow: hidden;
  border-radius: 34px;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ทำให้ overlay ไม่กินคลิกของแท็บ */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 80px 100px;
  text-align: left;
  color: white;
  pointer-events: none; /* ⬅️ สำคัญ */
  z-index: 5;
}

.subtitle {
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 5px;
}
.title {
  font-size: 65px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

/* ----- Tabs ----- */
.overlay-buttons {
  position: absolute;
  bottom: 0;
  left: 0;
  margin-left: 30px;
  display: flex;
  gap: 0;
  pointer-events: auto; /* ⬅️ ให้คลิกได้ */
  z-index: 10; /* ⬅️ อยู่เหนือ overlay */
}

.tab-link {
  padding: 12px 24px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(15, 23, 42, 0.45);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(2px);
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  appearance: none; /* สำหรับปุ่มให้หน้าตาเหมือนลิงก์ */
  border-radius: 0; /* ให้โค้งเฉพาะตัวแรก/ตัวสุดท้ายด้านล่าง */
}
.tab-link:hover {
  background: rgba(15, 23, 42, 0.6);
}

/* มุมโค้งเฉพาะซ้าย/ขวา */
.tab-link:first-child {
  border-top-left-radius: 10px;
}
.tab-link:last-child {
  border-top-right-radius: 10px;
}

/* ปุ่ม active = พื้นขาว */
.tab-link.active {
  background: #fff;
  color: #111827;
  border-color: #fff;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}
</style>
