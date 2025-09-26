<template>
  <header class="nav">
    <div class="nav-wrap">
      <!-- logo -->
      <a class="brand" href="#">
        <span class="brand-main">STUDYROOM</span>
        <span class="brand-accent">UP</span>
      </a>

      <!-- right links -->
      <nav class="nav-links">
        <a href="#" class="link">Profile</a>
        <a href="#" class="link">Logout</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
// no script needed
</script>

<style scoped>
/* แถบ navbar */
.nav {
  background: #ffffff;     /* สีพื้นหลัง */
  border-radius: 0;        /* เอาโค้งออก (ถ้าอยากให้เต็มจอจริงๆ) */
  margin: 0;               /* ยกเลิก margin */
  width: 100%;             /* ให้กว้างเต็มจอ */
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
  color: #1f2d3d;                       /* เทาเข้ม */
  font-size: 22px;
}
.brand-accent{
  font-weight: 900;
  color: #5865f2;                       /* น้ำเงินม่วงแบบในภาพ */
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
  text-decoration: none;
  padding-bottom: 6px;
}

/* เส้นใต้สีน้ำเงินคงอยู่ */
.link::after{
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: #5865f2;
  border-radius: 2px;
  opacity: .9;
}

/* hover ให้เข้มขึ้นนิดหน่อย */
.link:hover{ color:#111827; }
.link:hover::after{ opacity: 1; }

/* responsive */
@media (max-width: 720px){
  .brand-main{ font-size: 18px; }
  .brand-accent{ font-size: 26px; }
  .nav-links{ gap: 18px; }
}
</style>
