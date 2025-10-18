<!-- src/components/admin/HeroSectionAdmin.vue -->
<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route  = useRoute()

const isActive = (name, startsWithPath) =>
  route.name === name || (startsWithPath && route.path.startsWith(startsWithPath))

function go(name) {
  router.push({ name }).catch(() => {}) // กัน error duplicate nav
}
</script>

<template>
  <section class="hero">
    <img class="hero-img" src="/src/img/image 9.svg" alt="hero" />

    <div class="overlay">
      <h2 class="subtitle">
        โปรแกรมจองห้อง ศูนย์บรรณสารและการเรียนรู้ สถาบันนวัตกรรมการเรียนรู้
      </h2>
      <h1 class="title">มหาวิทยาลัยพะเยา</h1>
    </div>

    <div class="overlay-buttons">
      <!-- ใช้ทั้ง href (router.resolve) + คลิกแบบโปรแกรม -->
      <a
        class="tab-btn"
        :class="{ active: isActive('admin.rooms', '/admin/rooms') }"
        :href="router.resolve({ name: 'admin.rooms' }).href"
        @click.prevent="go('admin.rooms')"
        role="button"
      >จองห้อง</a>

      <a
        class="tab-btn"
        :class="{ active: isActive('admin.reviews', '/admin/reviews') }"
        :href="router.resolve({ name: 'admin.reviews' }).href"
        @click.prevent="go('admin.reviews')"
        role="button"
      >รีวิว</a>
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
  z-index: 40;
  isolation: isolate; /* สร้าง stacking context ของตัวเอง */
}

/* รูปไม่กินคลิก */
.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}

/* ข้อความบนรูป “ไม่รับคลิก” กันบังปุ่ม */
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
  z-index: 20;
  pointer-events: none;
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

  z-index: 99;                  /* สูงกว่าทุกอย่างในหน้า */
  pointer-events: auto;         /* ปุ่มภายในคลิกได้ */
}

.tab-btn {
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
  user-select: none;
}
.tab-btn:hover{ background: rgba(15,23,42,.6); }
.tab-btn:first-child{ border-top-left-radius: 10px; }
.tab-btn:last-child { border-top-right-radius: 10px; }
.tab-btn.active{
  background: #ffffff;
  color: #111827;
  border-color: #ffffff;
  box-shadow: 0 10px 22px rgba(0,0,0,.18);
}
</style>
