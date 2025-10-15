<script setup>
/* ===== รวมกับไฟล์เก่า (ESM + <script setup>) ===== */
import { ref, onMounted } from 'vue'
import { fetchReviews } from '@/services/api'
import ReviewModal from '@/components/user/ReviewModal.vue'

// === state หลักของหน้ารีวิว ===
const showModal = ref(false)
const page      = ref(1)
const pageSize  = ref(5)
const total     = ref(0)
const reviews   = ref([])

// ไม่กรองห้อง => null (ถ้าจะกรองให้ set เป็นหมายเลขห้อง)
const roomId = ref(null)
// ส่งรหัสนักศึกษาจริงจาก store/auth ได้ ภายหลังปรับได้เลย
const authStudentId = '67025044'

// === ดึงข้อมูล + จัดการเพจ ===
async function load() {
  const { data } = await fetchReviews({
    page: page.value, pageSize: pageSize.value,
    room_id: roomId.value ?? undefined
  })
  reviews.value = data.data
  total.value   = data.total
}
function onSubmitted(newRow) {
  reviews.value.unshift(newRow)
  total.value += 1
}
function prevPage(){ if (page.value > 1) { page.value--; load() } }
function nextPage(){ if (page.value * pageSize.value < total.value) { page.value++; load() } }

// === helper แสดงชื่อ/อักษรย่อ/วันที่ ===
function displayName(r){ return r.display_name || r.created_by || 'ผู้ใช้' }
function initials(r){
  const name = displayName(r).toString().trim()
  if (/^\d+$/.test(name)) return name.slice(-2)
  return name.slice(0,2).toUpperCase()
}
function formatDate(dt){
  try {
    return new Date(dt).toLocaleString('th-TH',{
      year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'
    })
  } catch { return dt }
}

onMounted(load)
</script>

<template>
  <section class="rv-page">
    <!-- แถบหัวเรื่อง + ปุ่มเขียนรีวิว -->
    <div class="rv-toolbar">
      <h2 class="rv-title">รีวิวทั้งหมด</h2>
      <button type="button" class="rv-btn rv-btn-primary" @click="showModal = true">
        <span class="rv-pen">✍️</span>
        <span class="rv-label">เขียนรีวิว</span>
      </button>
    </div>

    <!-- รายการรีวิวแบบการ์ด -->
    <div v-if="reviews.length === 0" class="rv-empty">ยังไม่มีรีวิว</div>
    <div v-else class="rv-list">
      <article v-for="r in reviews" :key="r.id" class="rv-card">
        <div class="rv-avatar">{{ initials(r) }}</div>

        <div class="rv-content">
          <div class="rv-row-top">
            <div class="rv-name">{{ displayName(r) }}</div>
            <div class="rv-stars" :aria-label="`${r.rating} ดาว`">
              <span v-for="n in 5" :key="n" class="rv-star" :class="{ active:n<=r.rating }">★</span>
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
/* ===== ดีไซน์ใหม่ ไม่ชนของเก่า (prefix rv-) ===== */
:root {
  --rv-bg:#f7f8fa; --rv-card:#fff;
  --rv-text:#1f2937; --rv-muted:#6b7280;
  --rv-primary:#2563eb; --rv-primary-600:#1d4ed8;
  --rv-border:#e5e7eb; --rv-star:#f59e0b;
}

.rv-page{ max-width:960px; margin:24px auto; padding:0 16px; }
.rv-toolbar{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.rv-title{ font-size:22px; font-weight:700; color:var(--rv-text); }

.rv-btn{
  display:inline-flex; align-items:center; justify-content:center;
  padding:10px 14px; border-radius:10px; border:1px solid var(--rv-border);
  background:#fff; color:var(--rv-text); cursor:pointer; transition:.15s ease;
  text-decoration:none; line-height:1;
}
.rv-btn:hover{ transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.06); }
.rv-btn:disabled{ opacity:.6; cursor:not-allowed; }
.rv-btn-primary{ background:var(--rv-primary); border-color:var(--rv-primary); color:#fff; }
.rv-btn-primary:hover{ background:var(--rv-primary-600); border-color:var(--rv-primary-600); }

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
.rv-empty{ text-align:center; color:var(--rv-muted); padding:24px 0; }

/* ===== FIX: บังคับให้ปุ่มแสดงข้อความชัดเจน ไม่โดนธีมอื่นกลบ ===== */
.rv-btn {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--rv-border, #e5e7eb);
  background: #fff;
  color: var(--rv-text, #111827) !important;
  font-size: 14px !important;
  line-height: 1 !important;
  letter-spacing: normal !important;
  text-indent: 0 !important;
  text-decoration: none !important;
  white-space: nowrap;
}
.rv-btn-primary {
  background: var(--rv-primary, #2563eb) !important;
  border-color: var(--rv-primary, #2563eb) !important;
  color: #fff !important;
}
/* กันเคสบางธีมซ่อนข้อความ/เปลี่ยนสีในปุ่ม */
.rv-btn * {
  color: inherit !important;
  visibility: visible !important;
  font-size: inherit !important;
}

@media (max-width:640px){
  .rv-toolbar{ flex-direction:column; align-items:flex-start; gap:10px; }
}
</style>
