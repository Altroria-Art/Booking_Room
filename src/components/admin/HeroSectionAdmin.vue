<template>
  <section class="hero">
    <img class="hero-img" src="/src/img/image 9.svg" alt="hero">

    <div class="overlay">
      <h2 class="subtitle">
        โปรแกรมจองห้อง ศูนย์บรรณสารและการเรียนรู้ สถาบันนวัตกรรมการเรียนรู้
      </h2>
      <h1 class="title">มหาวิทยาลัยพะเยา</h1>
    </div>

    <!-- Tabs ใต้แบนเนอร์ -->
    <div class="overlay-buttons">
      <RouterLink
        to="/"
        class="tab-link"
        :class="{ active: isActive('/') }"
      >จองห้อง</RouterLink>

      <RouterLink
        to="/review"
        class="tab-link"
        :class="{ active: isActive('/review') }"
      >รีวิว</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
// ให้ active เฉพาะ path ที่ตรงกันแบบ exact
const isActive = (path) => route.path === path
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
.subtitle { font-size: 24px; font-weight: 400; margin-bottom: 5px; }
.title    { font-size: 65px; font-weight: 700; margin: 0; line-height: 1.2; }

/* ----- Tabs ----- */
.overlay-buttons {
  position: absolute;
  bottom: 0;
  left: 0;
  margin-left: 30px;
  display: flex;
  gap: 0;
  width: 300px; /* ความกว้างรวมของปุ่มทั้งคู่ (ปรับได้ตามต้องการ) */
}

.tab-link {
  flex: 1; /* ให้แบ่งพื้นที่เท่ากัน */
  text-align: center;
  padding: 12px 0; /* ใช้ padding บน-ล่างเท่านั้น เพื่อให้เท่ากันเป๊ะ */
  border: 1px solid rgba(255,255,255,.45);
  background: rgba(15,23,42,.45);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(2px);
  transition: background .15s ease, color .15s ease, box-shadow .15s ease;

  text-decoration: none;
}

.tab-link:hover{
  background: rgba(15,23,42,.6);
}

/* มุมโค้งเฉพาะซ้าย/ขวา */
.tab-link:first-child{ border-top-left-radius: 10px; }
.tab-link:last-child { border-top-right-radius: 10px; }

/* ✅ ปุ่มที่ active = พื้นขาวเหมือนภาพ */
.tab-link.active{
  background: #ffffff;
  color: #111827;
  border-color: #ffffff;
  box-shadow: 0 10px 22px rgba(0,0,0,.18);
}
</style>
