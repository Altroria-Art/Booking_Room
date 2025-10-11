<script setup>
// ถ้าอยากทำ dynamic จาก API หรือ database ก็สามารถเปลี่ยนเป็น props / fetch ได้
const reviews = [
  {
    stars: 4,
    text: "ห้องสะอาด บรรยากาศดี เหมาะกับการอ่านหนังสือมากๆ อุปกรณ์ครบถ้วน ใช้งานง่าย สะดวกต่อการจอง",
    name: "ธนพร แสนคำ",
    code: "67025044",
    avatar: "/img/avatar1.jpg"
  },
  {
    stars: 5,
    text: "Estateln provided us with top-notch service. They helped us sell our property quickly and at a great price. We couldn’t be happier with the results.",
    name: "ธนพร แสนคำ",
    code: "67025044",
    avatar: "/img/avatar2.jpg"
  },
  {
    stars: 5,
    text: "Estateln provided us with top-notch service. They helped us sell our property quickly and at a great price. We couldn’t be happier with the results.",
    name: "ธนพร แสนคำ",
    code: "67025044",
    avatar: "/img/avatar3.jpg"
  },
  {
    stars: 4,
    text: "Estateln provided us with top-notch service. They helped us sell our property quickly and at a great price. We couldn’t be happier with the results.",
    name: "อนพล หยอดย้อย",
    code: "67022928",
    avatar: "/img/avatar4.jpg"
  }
]
</script>

<template>
  <section class="wrap">
    <!-- หัวข้อ -->
    <div class="review-title">
      <span class="bar"></span>
      <h2>Review <span class="hl">Room</span></h2>
    </div>
    <h3 class="subtitle">ช่องแสดงความคิดเห็น</h3>

    <!-- ปุ่ม -->
    <div style="display:flex; justify-content:flex-end; margin: 8px 0 20px;">
      <button class="review-cta">ความคิดเห็นทั้งหมด</button>
    </div>

    <!-- กริดการ์ด -->
    <div class="review-grid">
      <article v-for="(r,idx) in reviews" :key="idx" class="review-card">
        <div class="stars">
          <span v-for="n in r.stars" :key="n" class="star">★</span>
          <span v-for="n in (5 - r.stars)" :key="'o'+n" class="star empty">☆</span>
        </div>

        <p class="content">{{ r.text }}</p>

        <div class="reviewer">
          <img class="avatar" :src="r.avatar" alt="">
          <div>
            <div class="name">{{ r.name }}</div>
            <div class="code">{{ r.code }}</div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* section title */
.review-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0 12px;
}
.review-title .bar { width:4px; height:28px; background:#5b6ef5; border-radius:2px; }
.review-title h2 { margin:0; font-size:28px; color:#374151; font-weight:800; }
.review-title .hl { color:#5b6ef5; }
.subtitle { margin:0 0 20px; font-size:18px; font-weight:700; color:#1f2937; }

/* ปุ่ม “ความคิดเห็นทั้งหมด” */
.review-cta {
  background: #eef2ff;
  color: #1e40af;
  border: 1px solid #c7d2fe;
  padding: 10px 16px;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(91,110,245,.20);
  transition: transform .15s ease, box-shadow .15s ease;
  white-space: nowrap;
}
.review-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(91,110,245,.28);
}

/* การ์ดรีวิว */
.review-card {
  background: linear-gradient(180deg,#5b6ef5 0%, #4f5bd4 100%);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 14px;
  color: #eef2ff;
  box-shadow:
    0 8px 22px rgba(41,53,170,.26),
    inset 0 1px 0 rgba(255,255,255,.12);
  padding: 18px 20px;
  transition: transform .15s ease, box-shadow .15s ease;
}
.review-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 14px 28px rgba(41,53,170,.28),
    inset 0 1px 0 rgba(255,255,255,.12);
}

/* stars */
.stars { display:flex; gap:6px; margin-bottom:10px; }
.star {
  width:20px; height:20px; display:inline-grid; place-items:center;
  border-radius:50%; background:#ffd84d; color:#6b4f00;
  font-size:12px; line-height:1;
}
.star.empty { background:transparent; color:#ffd84d; }

/* เนื้อหา */
.content { font-size:13px; line-height:1.55; color:#e8edff; }

/* ผู้รีวิว */
.reviewer { display:flex; align-items:center; gap:12px; margin-top:14px; }
.avatar { width:34px; height:34px; border-radius:50%; object-fit:cover; }
.name { font-weight:700; color:#fff; }
.code { font-size:12px; color:#c7cffc; }

/* กริด */
.review-grid {
  display:grid;
  grid-template-columns: repeat(4, minmax(240px, 1fr));
  gap: 30px;
}
@media (max-width:1280px){ .review-grid{ grid-template-columns: repeat(3,1fr);} }
@media (max-width:992px){ .review-grid{ grid-template-columns: repeat(2,1fr);} }
@media (max-width:640px){ .review-grid{ grid-template-columns: 1fr;} }

.wrap { max-width: 1200px; margin: 40px auto; padding: 0 16px; }
</style>
