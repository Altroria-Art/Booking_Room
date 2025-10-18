<script setup>
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()

// เช็ค active ได้ทั้งจากชื่อ route และสำรองด้วย path
const isActive = (name, startsWithPath) =>
  route.name === name || (startsWithPath && route.path.startsWith(startsWithPath))
</script>

<template>
  <section class="hero">
    <!-- รูปพื้นหลัง -->
    <img class="hero-img" src="/src/img/image 9.svg" alt="hero" />

    <!-- ข้อความซ้อนบนรูป -->
    <div class="overlay">
      <h2 class="subtitle">
        โปรแกรมจองห้อง ศูนย์บรรณสารและการเรียนรู้ สถาบันนวัตกรรมการเรียนรู้
      </h2>
      <h1 class="title">มหาวิทยาลัยพะเยา</h1>
    </div>

    <!-- ปุ่ม -->
    <div class="overlay-buttons">
      <RouterLink
        :to="{ name: 'admin.rooms' }"
        class="tab-link"
        :class="{ active: isActive('admin.rooms', '/admin/rooms') }"
      >
        จองห้อง
      </RouterLink>

      <!-- ✅ แก้ให้ลิงก์ไปหน้ารีวิวของแอดมิน -->
      <RouterLink
        :to="{ name: 'admin.reviews' }"
        class="tab-link"
        :class="{ active: isActive('admin.reviews', '/admin/reviews') }"
      >
        รีวิว
      </RouterLink>
    </div>
  </section>
</template>

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
  width: 300px;
}
.tab-link {
  flex: 1;
  text-align: center;
  padding: 12px 0;
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
.tab-link:hover{ background: rgba(15,23,42,.6); }
.tab-link:first-child{ border-top-left-radius: 10px; }
.tab-link:last-child { border-top-right-radius: 10px; }
.tab-link.active{
  background: #ffffff;
  color: #111827;
  border-color: #ffffff;
  box-shadow: 0 10px 22px rgba(0,0,0,.18);
}
</style>
