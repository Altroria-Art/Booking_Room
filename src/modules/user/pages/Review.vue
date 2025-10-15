<script setup>
/* ===== หน้ารีวิวทั้งหมด (ตัด ReviewRoom ออกแล้ว) ===== */
import { ref, onMounted } from 'vue'
import { fetchReviews } from '@/services/api'
import ReviewModal from '@/components/user/ReviewModal.vue'

/* --- state หลัก --- */
const showModal = ref(false)
const page      = ref(1)
const pageSize  = ref(5)
const total     = ref(0)
const reviews   = ref([])

const loading   = ref(false)
const errorMsg  = ref('')

/* ไม่กรองห้อง => null (ถ้าจะกรองให้ set เป็นหมายเลขห้อง) */
const roomId = ref(null)
/* TODO: ดึงจาก store/auth ในโปรเจกต์จริงได้ */
const authStudentId = '67025044'

/* --- โหลดข้อมูล + กันรูปแบบ payload หลายแบบ --- */
async function load () {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetchReviews({
      page: page.value,
      pageSize: pageSize.value,
      room_id: roomId.value ?? undefined
    })

    // fetchReviews อาจคืน res หรือ res.data ขึ้นกับ services/api
    const payload = res?.data ?? res ?? {}
    const rows = payload.data ?? payload.rows ?? payload.items ?? []
    reviews.value = Array.isArray(rows) ? rows : []
    total.value = Number(payload.total ?? payload.count ?? reviews.value.length) || 0
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || 'โหลดรีวิวไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

/* เมื่อ submit รีวิวใหม่จากโมดอล */
function onSubmitted (newRow) {
  if (newRow) {
    reviews.value.unshift(newRow)
    total.value += 1
  }
}

function prevPage () {
  if (page.value > 1) { page.value--; load() }
}
function nextPage () {
  if (page.value * pageSize.value < total.value) { page.value++; load() }
}

/* helper: ชื่อ/อักษรย่อ/วันที่ */
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

onMounted(load)
</script>

<template>
  <section class="rv-page">
    <!-- หัวเรื่อง + ปุ่มเขียนรีวิว -->
    <div class="rv-toolbar">
      <h2 class="rv-title">รีวิวทั้งหมด</h2>
      <button type="button" class="rv-btn rv-btn-primary" @click="showModal = true">
        <span class="rv-pen">✍️</span>
        <span class="rv-label">เขียนรีวิว</span>
      </button>
    </div>

    <!-- แสดง error ถ้ามี -->
    <div v-if="errorMsg" class="rv-error">{{ errorMsg }}</div>

    <!-- สเตตัสกำลังโหลด -->
    <div v-else-if="loading" class="rv-empty">กำลังโหลดรีวิว…</div>

    <!-- รายการรีวิว -->
    <div v-else>
      <div v-if="reviews.length === 0" class="rv-empty">ยังไม่มีรีวิว</div>

      <div v-else class="rv-list">
        <article v-for="r in reviews" :key="r.id ?? r._id ?? (r.created_at + '-' + r.created_by)" class="rv-card">
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
/* ===== ดีไซน์ใหม่ (prefix rv-) ไม่มี ReviewRoom แล้ว ===== */
:root {
  --rv-bg:#f7f8fa; --rv-card:#fff;
  --rv-text:#1f2937; --rv-muted:#6b7280;
  --rv-primary:#2563eb; --rv-primary-600:#1d4ed8;
  --rv-border:#e5e7eb; --rv-star:#f59e0b;
}

.rv-page{ max-width:960px; margin:24px auto; padding:0 16px; }
.rv-toolbar{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.rv-title{ font-size:22px; font-weight:700; color:var(--rv-text); }

.rv-error{ background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:10px 12px; border-radius:10px; }
.rv-empty{ text-align:center; color:var(--rv-muted); padding:24px 0; }

.rv-btn{
  display:inline-flex !important; align-items:center; justify-content:center; gap:8px;
  padding:10px 14px; border-radius:10px; border:1px solid var(--rv-border);
  background:#fff; color:var(--rv-text) !important; font-size:14px !important;
  line-height:1 !important; text-decoration:none !important; white-space:nowrap;
  transition:.15s ease;
}
.rv-btn:hover{ transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.06); }
.rv-btn:disabled{ opacity:.6; cursor:not-allowed; }
.rv-btn-primary{ background:var(--rv-primary) !important; border-color:var(--rv-primary) !important; color:#fff !important; }
.rv-btn *{ color:inherit !important; }

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

@media (max-width:640px){
  .rv-toolbar{ flex-direction:column; align-items:flex-start; gap:10px; }
}
</style>
