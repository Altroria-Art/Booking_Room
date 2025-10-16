<script setup>
/* ===== หน้ารีวิวทั้งหมด พร้อมแถบตัวกรองแบบชิป ===== */
import { ref, onMounted, computed } from 'vue'
import { fetchReviews } from '@/services/api'
import ReviewModal from '@/components/user/ReviewModal.vue'

/* --- state หลัก --- */
const showModal  = ref(false)
const page       = ref(1)
const pageSize   = ref(5)
const total      = ref(0)
const reviews    = ref([])

const loading    = ref(false)
const errorMsg   = ref('')

/* ฟิลเตอร์ดาว: null = ทั้งหมด, 1..5 = เฉพาะดาวนั้น */
const selectedRating = ref(null)

/* สถิติแต่ละดาว (ถ้า API ส่งมาใช้ของ API; ถ้าไม่ ส่งคำนวณจากข้อมูลที่โหลดไว้) */
const stats = ref({ 1:0, 2:0, 3:0, 4:0, 5:0 })

/* ไม่กรองห้อง => null (ถ้าจะกรองให้ set เป็นหมายเลขห้อง) */
const roomId = ref(null)
/* TODO: ดึงจาก store/auth ในโปรเจกต์จริงได้ */
const authStudentId = '67025044'

/* --- โหลดข้อมูล --- */
async function load () {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetchReviews({
      page: page.value,
      pageSize: pageSize.value,
      room_id: roomId.value ?? undefined,
      rating: selectedRating.value ?? undefined,
    })

    const payload = res?.data ?? res ?? {}
    const rows = payload.data ?? payload.rows ?? payload.items ?? []
    reviews.value = Array.isArray(rows) ? rows : []

    total.value = Number(payload.total ?? payload.count ?? reviews.value.length) || 0

    // ใช้สถิติจาก API ถ้ามี ไม่งั้นคำนวณจากชุดข้อมูลที่มีอยู่
    const s = payload.stats
    if (s && typeof s === 'object') {
      stats.value = {
        1: Number(s[1] ?? s['1'] ?? 0),
        2: Number(s[2] ?? s['2'] ?? 0),
        3: Number(s[3] ?? s['3'] ?? 0),
        4: Number(s[4] ?? s['4'] ?? 0),
        5: Number(s[5] ?? s['5'] ?? 0),
      }
    } else {
      const tmp = {1:0,2:0,3:0,4:0,5:0}
      for (const r of reviews.value) {
        const k = Number(r.rating) || 0
        if (k>=1 && k<=5) tmp[k]++
      }
      stats.value = tmp
    }
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || 'โหลดรีวิวไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

/* เมื่อ submit รีวิวใหม่จากโมดอล */
function onSubmitted (newRow) {
  if (!newRow) return
  if (selectedRating.value == null || Number(newRow.rating) === selectedRating.value) {
    reviews.value.unshift(newRow)
  }
  total.value += 1
  const k = Number(newRow.rating) || 0
  if (k>=1 && k<=5) stats.value[k] = (stats.value[k] ?? 0) + 1
}

/* เพจจิเนชัน */
function prevPage () { if (page.value > 1) { page.value--; load() } }
function nextPage () { if (page.value * pageSize.value < total.value) { page.value++; load() } }

/* กรองบนหน้า (กรณี backend ยังไม่รองรับ rating) */
const visibleReviews = computed(() =>
  selectedRating.value == null
    ? reviews.value
    : reviews.value.filter(r => Number(r.rating) === selectedRating.value)
)

/* helper */
function displayName (r) { return r.display_name || r.created_by || 'ผู้ใช้' }
function initials (r) {
  const name = displayName(r).toString().trim()
  if (/^\d+$/.test(name)) return name.slice(-2)
  return name.slice(0, 2).toUpperCase()
}
function formatDate (dt) {
  try {
    return new Date(dt).toLocaleString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return dt }
}

/* เปลี่ยนฟิลเตอร์แล้วโหลดใหม่ตั้งแต่หน้า 1 */
function setRating (val) {
  if (selectedRating.value !== val) {
    selectedRating.value = val
    page.value = 1
    load()
  }
}

onMounted(load)
</script>

<template>
  <section class="rv-page">
    <!-- หัวเรื่อง (เอาปุ่มบน toolbar ออก) -->
    <div class="rv-toolbar">
      <h2 class="rv-title">รีวิวทั้งหมด</h2>
    </div>

    <!-- กรอบตัวกรอง + ปุ่มเขียนรีวิวแบบชิป -->
    <div class="rv-filter">
      <div class="chips-left">
        <button
          class="chip"
          :class="{ active: selectedRating === null }"
          @click="setRating(null)"
        >
          ความคิดเห็นทั้งหมด
        </button>

        <button
          v-for="n in [5,4,3,2,1]"
          :key="n"
          class="chip"
          :class="{ active: selectedRating === n }"
          @click="setRating(n)"
        >
          <span>{{ n }} ดาว</span>
          <strong> ({{ stats[n] ?? 0 }})</strong>
        </button>
      </div>

      <!-- ปุ่มเขียนรีวิวอยู่ขวาสุดในกรอบ -->
      <button type="button" class="chip chip-primary" @click="showModal = true">
        ✍️ แสดงความคิดเห็นที่นี่
      </button>
    </div>

    <!-- แสดง error ถ้ามี -->
    <div v-if="errorMsg" class="rv-error">{{ errorMsg }}</div>

    <!-- สเตตัสกำลังโหลด -->
    <div v-else-if="loading" class="rv-empty">กำลังโหลดรีวิว…</div>

    <!-- รายการรีวิว -->
    <div v-else>
      <div v-if="visibleReviews.length === 0" class="rv-empty">ยังไม่มีรีวิว</div>

      <div v-else class="rv-list">
        <article
          v-for="r in visibleReviews"
          :key="r.id ?? r._id ?? (r.created_at + '-' + r.created_by)"
          class="rv-card"
        >
          <div class="rv-avatar">{{ initials(r) }}</div>

          <div class="rv-content">
            <div class="rv-row-top">
              <div class="rv-name">{{ displayName(r) }}</div>
              <div class="rv-stars" :aria-label="`${r.rating} ดาว`">
                <span v-for="n in 5" :key="n" class="rv-star" :class="{ active: n <= (r.rating ?? 0) }">★</span>
              </div>
            </div>

            <p class="rv-comment">{{ r.comment }}</p>

            <div class="rv-meta">
              <span>{{ formatDate(r.created_at) }}</span>
              <span v-if="r.room_id">• ห้อง #{{ r.room_id }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- เพจจิเนชัน -->
      <div class="rv-pager">
        <button class="rv-btn" :disabled="page===1" @click="prevPage">ก่อนหน้า</button>
        <span>หน้า {{ page }}</span>
        <button class="rv-btn" :disabled="page*pageSize>=total" @click="nextPage">ถัดไป</button>
        <span class="rv-muted">รวม {{ total }} รีวิว</span>
      </div>
    </div>

    <!-- โมดอลเขียนรีวิว -->
    <ReviewModal
      v-model:open="showModal"
      :room-id="roomId"
      :created-by="authStudentId"
      @submitted="onSubmitted"
    />
  </section>
</template>

<style scoped>
:root {
  --rv-bg:#f7f8fa; --rv-card:#fff;
  --rv-text:#1f2937; --rv-muted:#6b7280;
  --rv-primary:#2563eb; --rv-primary-600:#1d4ed8;
  --rv-border:#e5e7eb; --rv-star:#f59e0b;
  --rv-accent:#eef2ff;
}

/* โครงหลัก */
.rv-page{ max-width:960px; margin:24px auto; padding:0 16px; }
.rv-toolbar{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.rv-title{ font-size:22px; font-weight:700; color:var(--rv-text); }
.rv-error{ background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:10px 12px; border-radius:10px; }
.rv-empty{ text-align:center; color:var(--rv-muted); padding:24px 0; }

/* ปุ่มทั่วไป (ใช้ในเพจจิเนชัน) */
.rv-btn{
  display:inline-flex !important; align-items:center; justify-content:center; gap:8px;
  padding:10px 14px; border-radius:10px; border:1px solid var(--rv-border);
  background:#fff; color:var(--rv-text) !important; font-size:14px !important;
  line-height:1 !important; text-decoration:none !important; white-space:nowrap;
  transition:.15s ease; overflow:visible !important;
}
.rv-btn:hover{ transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.06); }
.rv-btn:disabled{ opacity:.6; cursor:not-allowed; }
.rv-btn::before, .rv-btn::after{ content:none !important; }

/* ===== แถบตัวกรองแบบชิป ===== */
.rv-filter{
  background:#fff8ee;
  border:1px solid #fdebd1;
  padding:14px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:space-between;   /* ซ้าย=ชิปกรอง ขวา=ปุ่มเขียน */
  gap:12px;
  margin-bottom:16px;
}
.chips-left{
  display:flex;
  flex-wrap:wrap;
  gap:16px;
}
.chip{
  background:#fff;
  border:1px solid #e5e7eb;
  padding:10px 14px;
  border-radius:12px;
  cursor:pointer;
  transition:.15s ease;
  color:#111827;
}
.chip strong{ font-weight:700; }
.chip:hover{ box-shadow:0 2px 8px rgba(0,0,0,.06); transform: translateY(-1px); }
.chip.active{
  outline:2px solid #4f46e5;
  outline-offset:0;
  border-color:#c7d2fe;
  color:#1f2a6b;
}

/* ปุ่มเขียนรีวิวแบบชิป (เด่นทางขวา) */
.chip-primary{
  border-color:#2563eb;
  color:#1d4ed8;
  box-shadow:0 0 0 2px rgba(37,99,235,.12);
}
.chip-primary:hover{
  background:#eff6ff;
  box-shadow:0 0 0 2px rgba(37,99,235,.22);
}

@media (max-width:640px){
  .rv-toolbar{ flex-direction:column; align-items:flex-start; gap:10px; }
  .rv-filter{ align-items:stretch; }
  .chip-primary{ width:100%; text-align:center; }
}

/* การ์ดรายการ */
.rv-list{ display:grid; gap:14px; }
.rv-card{
  display:grid; grid-template-columns:56px 1fr; gap:12px;
  background:var(--rv-card); border:1px solid var(--rv-border);
  border-radius:14px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,.04);
}
.rv-avatar{
  width:56px; height:56px; border-radius:50%; display:grid; place-items:center;
  background:linear-gradient(135deg,#a5b4fc,#93c5fd); color:#fff; font-weight:700; font-size:18px;
}
.rv-content{ display:flex; flex-direction:column; gap:6px; }
.rv-row-top{ display:flex; align-items:center; justify-content:space-between; }
.rv-name{ font-weight:600; color:var(--rv-text); }
.rv-stars .rv-star{ color:#e5e7eb; font-size:16px; letter-spacing:1px; }
.rv-stars .rv-star.active{ color:var(--rv-star); text-shadow:0 0 1px rgba(0,0,0,.15); }
.rv-comment{ color:var(--rv-text); line-height:1.5; white-space:pre-wrap; }
.rv-meta{ font-size:12px; color:var(--rv-muted); }

.rv-pager{ display:flex; align-items:center; gap:10px; margin-top:14px; }
.rv-muted{ color:var(--rv-muted); margin-left:auto; }
</style>
