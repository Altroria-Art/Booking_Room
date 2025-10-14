<script setup lang="ts">
import { RouterLink } from 'vue-router'

const props = defineProps<{
  // ปลายทางเมื่อกดโลโก้: รับเป็น path หรือ route object ก็ได้
  homeTo?: string | Record<string, any>
}>()

const homeTo = props.homeTo ?? '/';  // ค่าเริ่มต้นคือหน้า user
</script>

<!-- src/components/MainNavbar.vue -->
<template>
  <header class="nav">
    <div class="nav-wrap">
      <!-- ใช้ :to แทน to ตายตัว -->
      <RouterLink class="brand" :to="homeTo">
        <span class="brand-main">STUDYROOM</span>
        <span class="brand-accent">UP</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="#" class="link">Profile</RouterLink>
        <RouterLink to="#" class="link">Logout</RouterLink>
      </nav>
    </div>
  </header>
</template>


<style scoped>
/* แถบ navbar */
.nav {
  background: #ffffff;
  margin: 0;
  width: 100%;
  box-shadow: 0 6px 18px rgba(0,0,0,.05);
}

/* คอนเทนต์ด้านใน */
.nav-wrap{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
}

/* โลโก้ */
.brand{
  display: inline-flex;
  gap: 8px;
  text-decoration: none;
  align-items: baseline;
  letter-spacing: .5px;
}
.brand-main{
  font-weight: 800;
  color: #1f2d3d;
  font-size: 22px;
}
.brand-accent{
  font-weight: 900;
  color: #5865f2;
  font-size: 32px;
  line-height: 1;
}

/* ลิงก์ขวา */
.nav-links{
  display: inline-flex;
  align-items: center;
  gap: 28px;
}
.link{
  position: relative;
  font-size: 14px;
  color: #334155;
  text-decoration: none;   /* ตัดเส้นใต้ทั้งหมด */
  padding-bottom: 0;       /* ไม่เผื่อพื้นที่เส้นใต้ */
}

/* ปิด pseudo-element ทุกกรณี (กันพลาด) */
.link::after,
.link:hover::after,
.link.router-link-active::after,
.link.router-link-exact-active::after{
  content: none !important;
  display: none !important;
}

/* hover แค่เปลี่ยนสีตัวอักษรเล็กน้อย */
.link:hover{ color:#111827; }

@media (max-width: 720px){
  .brand-main{ font-size: 18px; }
  .brand-accent{ font-size: 26px; }
  .nav-links{ gap: 18px; }
}
</style>
