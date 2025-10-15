<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// --- ข้อมูลตัวอย่าง (เหมือนเดิม) ---
const reviews = [
  { stars: 4, text: "ห้องสะอาด บรรยากาศดี เหมาะกับการอ่านหนังสือมากๆ อุปกรณ์ครบถ้วน ใช้งานง่าย สะดวกต่อการจอง", name: "ธนพร แสนคำ", code: "67025044", avatar: "/img/avatar1.jpg" },
  { stars: 5, text: "ห้องสะอาดและเก็บเสียงดีมากๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆ", name: "ธนพร แสนคำ", code: "67025044", avatar: "/img/avatar2.jpg" },
  { stars: 5, text: "ห้องดีมาก มีพื้นที่กว้างสะดวก ห้องเย็นสบาย", name: "ธนพร แสนคำ", code: "67025044", avatar: "/img/avatar3.jpg" },
  { stars: 4, text: "very good mak mak", name: "สมพล หยอดย้อย", code: "67022928", avatar: "" }
]

// ไอคอนโปรไฟล์ fallback
const defaultAvatar =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111">
      <circle cx="12" cy="7.5" r="3.5"/>
      <path d="M12 13c-4 0-8 2-8 5.2V20h16v-1.8C20 15 16 13 12 13z"/>
    </svg>
  `)

const srcOrDefault = (src) => (src && src.trim() ? src : defaultAvatar)

// ✅ ซ่อนคอมโพเนนต์เมื่ออยู่หน้ารีวิว (ครอบคลุม path และ name)
const route = useRoute()
const isReviewPage = computed(() => {
  const p = (route.path || '').toLowerCase()
  const n = (route.name ? String(route.name) : '').toLowerCase()
  // จับทั้ง /review, /user/review, /xxx/review/123 และชื่อ route ที่มีคำว่า review
  return /(^|\/)review(\/|$)/.test(p) || /review/.test(n)
})
</script>

<template>
  <!-- ซ่อนทั้งก้อนเมื่ออยู่หน้ารีวิว -->
  <section v-if="!isReviewPage" class="wrap">
    <!-- หัวข้อ -->
    <div class="review-title">
      <span class="bar"></span>
      <h2>Review <span class="hl">Room</span></h2>
    </div>
    <h3 class="subtitle">ช่องแสดงความคิดเห็น</h3>

    <!-- ปุ่มไปหน้ารีวิวทั้งหมด -->
    <div style="display:flex; justify-content:flex-end; margin: 8px 0 20px;">
      <RouterLink :to="{ name: 'user.review' }" class="review-cta">ความคิดเห็นทั้งหมด</RouterLink>
    </div>

    <!-- กริดการ์ด -->
    <div class="review-grid">
      <article v-for="(r,idx) in reviews" :key="idx" class="review-card">
        <div class="stars">
          <span v-for="n in r.stars" :key="`f-${n}`" class="star">★</span>
          <span v-for="n in (5 - r.stars)" :key="`e-${n}`" class="star empty">☆</span>
        </div>

        <p class="content">{{ r.text }}</p>

        <div class="reviewer">
          <div class="avatar">
            <img
              :src="srcOrDefault(r.avatar)"
              alt="profile"
              @error="(e) => { e.target.src = defaultAvatar }"
            />
          </div>
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
.review-title { display:flex; align-items:center; gap:12px; margin:8px 0 12px; }
.review-title .bar { width:4px; height:28px; background:#5b6ef5; border-radius:2px; }
.review-title h2 { margin:0; font-size:28px; color:#374151; font-weight:800; }
.review-title .hl { color:#5b6ef5; }
.subtitle { margin:0 0 20px; font-size:18px; font-weight:700; color:#1f2937; }

/* ปุ่ม “ความคิดเห็นทั้งหมด” */
.review-cta {
  background:#eef2ff; color:#1e40af; border:1px solid #c7d2fe;
  padding:10px 16px; border-radius:14px;
  box-shadow:0 8px 24px rgba(91,110,245,.20);
  transition:transform .15s ease, box-shadow .15s ease; white-space:nowrap;
  text-decoration:none;
}
.review-cta:hover { transform:translateY(-1px); box-shadow:0 12px 28px rgba(91,110,245,.28); }

/* การ์ดรีวิว */
.review-card {
  background:linear-gradient(180deg,#5b6ef5 0%, #4f5bd4 100%);
  border:1px solid rgba(255,255,255,.14); border-radius:14px; color:#eef2ff;
  box-shadow:0 8px 22px rgba(41,53,170,.26), inset 0 1px 0 rgba(255,255,255,.12);
  padding:18px 20px; transition:transform .15s ease, box-shadow .15s ease;
  display:flex; flex-direction:column; justify-content:space-between; min-height:220px;
}

/* ดาวแบบวงกลม */
.stars{ display:flex; gap:14px; margin-bottom:12px; }
.star{
  width:28px; height:28px; border-radius:50%; display:grid; place-items:center;
  background:#373a4a; color:#ffd84d; font-size:16px; line-height:1;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.06);
}
.star.empty{ background: rgba(255,255,255,.16); color:#8fa0ff; }

/* เนื้อหารีวิว */
.content { font-size:13px; line-height:1.55; color:#e8edff; word-wrap:break-word; overflow-wrap:break-word; white-space:normal; margin-bottom:12px; }

/* ผู้รีวิวชิดล่าง */
.reviewer { display:flex; align-items:center; gap:12px; margin-top:auto; padding-top:10px; border-top:1px solid rgba(255,255,255,.1); }

/* Avatar */
.avatar{ width:34px; height:34px; border-radius:50%; background:#fff; display:grid; place-items:center; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.15); }
.avatar img{ width:22px; height:22px; object-fit:cover; display:block; }

.name { font-weight:700; color:#fff; }
.code { font-size:12px; color:#c7cffc; }

/* กริด */
.review-grid { display:grid; grid-template-columns: repeat(4, minmax(240px, 1fr)); gap:30px; }
@media (max-width:1280px){ .review-grid{ grid-template-columns: repeat(3,1fr);} }
@media (max-width:992px){ .review-grid{ grid-template-columns: repeat(2,1fr);} }
@media (max-width:640px){ .review-grid{ grid-template-columns: 1fr;} }

.wrap { max-width:1200px; margin:40px auto; padding:0 16px; }
</style>
