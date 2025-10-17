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

<<<<<<< Updated upstream
      <!-- ปุ่มหลักฐานการจอง: ไม่ลิงก์ไปหน้าไหน -->
      <button type="button" class="tab-link" @click.stop.prevent="openProof">
        หลักฐานการจอง
      </button>
=======
      <!-- เปลี่ยนจาก RouterLink -> ปุ่มเรียก API -->
      <button
        type="button"
        class="tab-link"
        :class="{ active: showProof }"
        @click="openProof"
      >หลักฐานการจอง</button>
>>>>>>> Stashed changes

      <RouterLink
        to="/user/review"
        class="tab-link"
        :class="{ active: isActive(['/user/review', '/review']) }"
        >รีวิว</RouterLink
      >
    </div>

    <!-- Modal -->
    <BookingProofModal :open="showProof" @close="closeProof" />
  </section>

  <!-- โมดัลหลักฐานการจอง -->
  <BookingProofModal
    v-model="showProof"
    :empty="proofEmpty"
    :proof="proof"
    @cancel="handleCancel"
  />
</template>

<script setup>
<<<<<<< Updated upstream
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import BookingProofModal from "@/components/user/BookingProofModal.vue";

const route = useRoute();

// true ถ้า path ตรง หรือเป็นเส้นทางย่อยของ target (เช่น /user/review/123)
const isActive = (target) => {
  const paths = Array.isArray(target) ? target : [target];
  return paths.some((p) => route.path === p || route.path.startsWith(p + "/"));
};

// state & handlers สำหรับ modal
const showProof = ref(false);
const openProof = () => {
  showProof.value = true;
};
const closeProof = () => {
  showProof.value = false;
};
=======
import { RouterLink, useRoute } from 'vue-router'
import { ref } from 'vue'
import { fetchMyBookingProof, cancelBooking } from '@/services/api'
import BookingProofModal from '@/components/user/BookingProofModal.vue'

const route = useRoute()

// true ถ้า path ตรง หรือเป็นเส้นทางย่อยของ target (เช่น /user/review/123)
const isActive = (target) => {
  const paths = Array.isArray(target) ? target : [target]
  return paths.some(p => route.path === p || route.path.startsWith(p + '/'))
}

// state ของโมดัล
const showProof = ref(false)
const proofEmpty = ref(false)
const proof = ref(null)

// เปิดโมดัลและโหลดข้อมูลจาก API
async function openProof () {
  try {
    const { data } = await fetchMyBookingProof() // ไม่ส่ง date = เอารายการล่าสุดของผู้ใช้
    if (!data.hasBooking) {
      proof.value = null
      proofEmpty.value = true
    } else {
      proof.value = data.booking
      proofEmpty.value = false
    }
  } catch (e) {
    console.error(e)
    proof.value = null
    proofEmpty.value = true
  } finally {
    showProof.value = true
  }
}

// (ทางเลือก) ปุ่มยกเลิกการจองในโมดัล
async function handleCancel (id) {
  try {
    await cancelBooking(id)
    showProof.value = false
  } catch (e) {
    console.error(e)
    // จะ toast แจ้งผิดพลาดก็ได้
  }
}
>>>>>>> Stashed changes
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
  z-index: 10; /* สำคัญ: ให้ปุ่มลอยเหนือรูป/overlay เสมอ */
}

.tab-link {
  padding: 12px 24px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(15, 23, 42, 0.45);
  color: #fff;
<<<<<<< Updated upstream
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(2px);
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
.tab-link:hover {
  background: rgba(15, 23, 42, 0.6);
=======
  font-size: 16px; font-weight: 600;
  cursor: pointer; backdrop-filter: blur(2px);
  transition: background .15s ease, color .15s ease, box-shadow .15s ease;
  /* ให้ปุ่ม <button> ดูเหมือนลิงก์ */
  appearance: none; border-radius: 0;
>>>>>>> Stashed changes
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
