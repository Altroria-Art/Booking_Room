<script setup>
import { ref, computed, onMounted, onActivated, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchReviews } from '@/services/api'

/** ใช้เป็น widget แสดง “คอมเมนต์ล่าสุด”
 * props:
 *   - limit          : จำนวนการ์ดที่จะแสดง (default 4)
 *   - roomId         : กรองตามห้อง (null = ทุกห้อง)
 *   - autoRefreshMs  : รีเฟรชอัตโนมัติทุก X ms (0 = ปิด)
 */
const props = defineProps({
  limit: { type: Number, default: 4 },
  roomId: { type: [Number, String, null], default: null },
  autoRefreshMs: { type: Number, default: 0 },
})

/* ซ่อนคอมโพเนนต์ตัวนี้บนหน้ารีวิว (ไม่ว่าชื่อ path หรือ name) */
const route = useRoute()
const isReviewPage = computed(() => {
  const p = (route.path || '').toLowerCase()
  const n = (route.name ? String(route.name) : '').toLowerCase()
  return /(^|\/)review(\/|$)/.test(p) || /review/.test(n)
})

/* state */
const items = ref([])          // คอมเมนต์ล่าสุดที่จะแสดง
const loading = ref(false)
const errorMsg = ref('')

/* helper */
const defaultAvatar =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111">
      <circle cx="12" cy="7.5" r="3.5"/>
      <path d="M12 13c-4 0-8 2-8 5.2V20h16v-1.8C20 15 16 13 12 13z"/>
    </svg>
  `)
const srcOrDefault = (src) => (src && String(src).trim() ? src : defaultAvatar)
const displayName = (r) => r?.display_name || r?.created_by || 'ผู้ใช้'

/* โหลด “คอมเมนต์ล่าสุด” */
async function loadLatest () {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetchReviews({
      page: 1,
      pageSize: props.limit,
      room_id: props.roomId ?? undefined,
      sort: 'created_at',
      order: 'desc',
    })

    const payload = res?.data ?? res ?? {}
    let rows = payload.data ?? payload.rows ?? payload.items ?? []

    // จัดล่าสุดก่อน เผื่อ backend ไม่ได้ sort ให้
    rows = Array.isArray(rows)
      ? rows.slice().sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0))
      : []

    items.value = rows.slice(0, props.limit)
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || 'โหลดคอมเมนต์ไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

/* ✅ โหลดครั้งแรก + เมื่อกลับมาที่หน้า (ถ้าใช้ keep-alive) */
onMounted(loadLatest)
onActivated(loadLatest)

/* ✅ ถ้า route กลับมาที่ rooms หรือ roomId เปลี่ยน → โหลดใหม่ */
watch(() => route.name, (n) => {
  const name = String(n || '').toLowerCase()
  const path = (route.path || '').toLowerCase()
  if (name.includes('rooms') || /(^|\/)rooms(\/|$)/.test(path)) loadLatest()
})
watch(() => props.roomId, () => loadLatest())

/* ✅ ฟัง event “มีรีวิวใหม่” จากหน้า Review.vue แล้วอัปเดตทันที */
function onCreated(ev) {
  const row = ev?.detail
  if (!row) return
  const merged = [row, ...items.value]
    .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0))
    .slice(0, props.limit)
  items.value = merged
}
onMounted(() => window.addEventListener('reviews:created', onCreated))
onBeforeUnmount(() => window.removeEventListener('reviews:created', onCreated))

/* (ออปชัน) รีเฟรชอัตโนมัติทุก X ms */
let timer = null
onMounted(() => {
  if (props.autoRefreshMs > 0) {
    timer = setInterval(loadLatest, props.autoRefreshMs)
  }
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

/* ให้หน้าแม่สั่งรีโหลดได้ */
defineExpose({ reload: loadLatest })
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

    <!-- สถานะโหลด/ผิดพลาด -->
    <div v-if="loading" class="status">กำลังโหลดคอมเมนต์ล่าสุด…</div>
    <div v-else-if="errorMsg" class="status error">{{ errorMsg }}</div>

    <!-- กริดการ์ด -->
    <div v-else class="review-grid">
      <article v-for="(r,idx) in items" :key="r.id ?? idx" class="review-card">
        <div class="stars">
          <span v-for="n in (r.rating ?? 0)" :key="`f-${idx}-${n}`" class="star">★</span>
          <span v-for="n in (5 - (r.rating ?? 0))" :key="`e-${idx}-${n}`" class="star empty">☆</span>
        </div>

        <p class="content">{{ r.comment || r.text }}</p>

        <!-- ผู้รีวิว (ชิดล่าง) -->
        <div class="reviewer">
          <div class="avatar">
            <img
              :src="srcOrDefault(r.avatar)"
              alt="profile"
              @error="(e) => { e.target.src = defaultAvatar }"
            />
          </div>
          <div>
            <div class="name">{{ displayName(r) }}</div>
            <div class="code">{{ r.student_code || r.created_by || '' }}</div>
          </div>
        </div>
      </article>

      <!-- กรณีไม่มีข้อมูล -->
      <div v-if="!items.length && !loading && !errorMsg" class="status">ยังไม่มีคอมเมนต์</div>
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
  padding:10px 16px; border-radius:14px; text-decoration:none;
  box-shadow:0 8px 24px rgba(91,110,245,.20);
  transition: transform .15s ease, box-shadow .15s ease; white-space:nowrap;
}
.review-cta:hover { transform: translateY(-1px); box-shadow:0 12px 28px rgba(91,110,245,.28); }

/* การ์ดรีวิว */
.review-card {
  background:linear-gradient(180deg,#5b6ef5 0%, #4f5bd4 100%);
  border:1px solid rgba(255,255,255,.14); border-radius:14px; color:#eef2ff;
  box-shadow:0 8px 22px rgba(41,53,170,.26), inset 0 1px 0 rgba(255,255,255,.12);
  padding:18px 20px; transition: transform .15s ease, box-shadow .15s ease;
  display:flex; flex-direction:column; justify-content:space-between; min-height:220px;
}

/* ดาว */
.stars{ display:flex; gap:14px; margin-bottom:12px; }
.star{
  width:28px; height:28px; border-radius:50%;
  display:grid; place-items:center;
  background:#373a4a; color:#ffd84d; font-size:16px; line-height:1;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.06);
}
.star.empty{ background: rgba(255,255,255,.16); color:#8fa0ff; }

/* เนื้อหารีวิว */
.content { font-size:13px; line-height:1.55; color:#e8edff; word-wrap:break-word; overflow-wrap:break-word; white-space:normal; margin-bottom:12px; }

/* ผู้รีวิว */
.reviewer { display:flex; align-items:center; gap:12px; margin-top:auto; padding-top:10px; border-top:1px solid rgba(255,255,255,.1); }
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

/* สถานะ */
.status{ color:#1f2937; background:#f3f4f6; border:1px solid #e5e7eb; padding:12px; border-radius:10px; }
.status.error{ color:#991b1b; background:#fee2e2; border-color:#fecaca; }
</style>
