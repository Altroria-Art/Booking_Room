<template>
  <section class="hero">
    <img class="hero-img" src="/src/img/image 9.svg" alt="hero">
    <div class="overlay">
      <h2 class="subtitle">
        โปรแกรมจองห้อง ศูนย์บรรณสารและการเรียนรู้ สถาบันนวัตกรรมการเรียนรู้
      </h2>
      <h1 class="title">มหาวิทยาลัยพะเยา</h1>
    </div>
    <div class="overlay-buttons">
      <button>จองห้อง</button>
      <button>หลักฐานการจอง</button>
      <button>รีวิว</button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  max-width: 1384px;   /* กว้างสุดไม่เกิน 1384 */
  aspect-ratio: 1384 / 572;  /* รักษาสัดส่วน */
  margin: 20px auto;
  overflow: hidden;
  border-radius: 34px;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* overlay ครอบทั้ง hero */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;   /* ชิดซ้าย */
  justify-content: flex-start; /* ชิดบน */
  padding: 80px 100px;        /* ขยับลงมาและเว้นจากซ้าย */
  text-align: left;
  color: white;
}

/* subtitle */
.subtitle {
  font-size: 24px;    /* เดิมอาจจะ 18-20px → เพิ่มขึ้น */
  font-weight: 400;
  margin-bottom: 5px;
}

.title {
  font-size: 65px;    /* เดิมอาจจะ 36-42px → เพิ่มขึ้น */
  font-weight: 700;
  margin: 0;
  line-height: 1.2;   /* ลดช่องว่างบรรทัดลง */
}

.overlay-buttons {
  position: absolute;
  bottom: 0;
  left: 0;
  margin-left: 30px; /* ขยับจากซ้าย */
  display: flex;
}


.overlay-buttons button {
  padding: 12px 24px;
  border: none;
  border-radius: 0;   /* เอามุมโค้งออก */
  background: white;
  color: black;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

/* ปุ่ม hover */
.overlay-buttons button:hover {
  background: #e5e5e5;
}

/* ปุ่มแรกให้มุมบนซ้ายโค้ง */
.overlay-buttons button:first-child {
  border-top-left-radius: 10px;
}

/* ปุ่มสุดท้ายให้มุมบนขวาโค้ง */
.overlay-buttons button:last-child {
  border-top-right-radius: 10px;
}

</style>
