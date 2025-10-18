<!-- src/modules/admin/pages/Reviews.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAdminReviews, deleteAdminReview, getAdminReviewSummary } from '@/services/api'

// state
const items = ref([])
const loading = ref(false)
const page    = ref(1)
const last    = ref(1)
const total   = ref(0)
const roomId  = ref(null)         // ถ้าต้องการกรองตามห้อง ให้เซ็ตค่ามาได้
const rating  = ref(0)            // 0 = ทั้งหมด, 1..5 = กรองตามดาว
const counts  = ref({ 1:0,2:0,3:0,4:0,5:0 })

async function loadSummary() {
  const { data } = await getAdminReviewSummary({ room_id: roomId.value || undefined })
  total.value = data.total || 0
  counts.value = data.by_rating || {1:0,2:0,3:0,4:0,5:0}
}

async function load(pageNo = 1) {
  loading.value = true
  const { data } = await getAdminReviews({
    page: pageNo,
    pageSize: 10,
    room_id: roomId.value || undefined,
    rating: rating.value || undefined,
  })
  items.value = data.data
  page.value  = data.current_page
  last.value  = data.last_page
  loading.value = false
}

function setFilterStar(v) {
  rating.value = v
  load(1)
}

async function removeRow(id) {
  if (!confirm('ยืนยันการลบรีวิวนี้?')) return
  await deleteAdminReview(id)
  await Promise.all([loadSummary(), load(page.value)])
}

// simple helper for stars
function stars(n) {
  const filled = '●'.repeat(n)
  const empty  = '○'.repeat(5 - n)
  return filled + empty
}

onMounted(async () => {
  await loadSummary()
  await load(1)
})

// pagination helper
const pages = computed(() => {
  const arr = []
  const sz = 5
  const start = Math.max(1, page.value - 2)
  const end   = Math.min(last.value, start + sz - 1)
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
})
const lastShown = computed(() => pages.value.length ? pages.value[pages.value.length - 1] : 0)
</script>

<template>
  <div>
    <!-- ✅ เอา HeroSectionAdmin ออก: Layout จะเป็นคนแสดงให้เอง -->

    <section class="wrap">
      <h2 class="section-title">รีวิว Review</h2>

      <!-- chips -->
      <div class="chips-row">
        <button
          class="chip"
          :class="{ active: rating===0 }"
          @click="setFilterStar(0)"
        >
          ความคิดเห็นทั้งหมด <span class="count">({{ total }})</span>
        </button>

        <button class="chip" :class="{active: rating===5}" @click="setFilterStar(5)">5 ดาว <span class="count">({{ counts[5] }})</span></button>
        <button class="chip" :class="{active: rating===4}" @click="setFilterStar(4)">4 ดาว <span class="count">({{ counts[4] }})</span></button>
        <button class="chip" :class="{active: rating===3}" @click="setFilterStar(3)">3 ดาว <span class="count">({{ counts[3] }})</span></button>
        <button class="chip" :class="{active: rating===2}" @click="setFilterStar(2)">2 ดาว <span class="count">({{ counts[2] }})</span></button>
        <button class="chip" :class="{active: rating===1}" @click="setFilterStar(1)">1 ดาว <span class="count">({{ counts[1] }})</span></button>

        <div class="spacer"></div>
        <button class="chip primary" disabled>แสดงความคิดเห็นนี้</button>
      </div>

      <!-- list -->
      <div v-if="loading" class="loading">กำลังโหลด…</div>
      <div v-else class="review-list">
        <div v-for="r in items" :key="r.id" class="review-item">
          <div class="avatar">👤</div>
          <div class="content">
            <div class="row-1">
              <div class="name">{{ r.user_name || r.created_by }}</div>
              <div class="stars" :title="r.rating + ' ดาว'">{{ stars(r.rating) }}</div>
              <div class="date">{{ new Date(r.created_at).toLocaleString() }}</div>
              <button class="del" @click="removeRow(r.id)" title="ลบรีวิว">🗑️</button>
            </div>
            <div class="comment">{{ r.comment }}</div>
          </div>
        </div>

        <div v-if="items.length===0" class="empty">ยังไม่มีรีวิว</div>
      </div>

      <!-- pagination -->
      <div class="pager" v-if="last>1">
        <button class="pg" :disabled="page<=1" @click="load(page-1)">‹</button>
        <button
          v-for="p in pages" :key="p"
          class="pg" :class="{active: p===page}"
          @click="load(p)"
        >{{ p }}</button>
        <span v-if="lastShown < last">…</span>
        <button class="pg" :disabled="page>=last" @click="load(page+1)">›</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.wrap{ max-width: 1080px; margin: 0 auto; padding: 12px 16px 40px; }
.section-title{
  color:#5a6ad0; font-size:26px; font-weight:700; margin:12px 0 16px;
  display:flex; align-items:center; gap:8px;
}
.section-title::before{
  content:""; width:4px; height:24px; background:#5a6ad0; border-radius:4px;
}

.chips-row{
  display:flex; align-items:center; gap:10px;
  background:#fff6e9; padding:12px; border-radius:8px; margin-bottom:18px;
}
.spacer{ flex:1; }
.chip{
  border:1px solid #e6e6e6; background:#fff; color:#222;
  padding:8px 12px; border-radius:8px; font-weight:600; font-size:14px;
  cursor:pointer;
}
.chip .count{ color:#7b7b7b; font-weight:500; }
.chip.active{ background:#eef2ff; border-color:#c7d2fe; color:#1f2a5a; }
.chip.primary{ background:#e9efff; border-color:#c7d2fe; color:#1d4ed8; }

.review-list{ display:flex; flex-direction:column; gap:18px; }
.review-item{
  display:flex; gap:12px; padding:12px 6px 16px; border-bottom:1px solid #eee;
}
.avatar{ width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:18px; }

.content{ flex:1; }
.row-1{
  display:grid; grid-template-columns: 1fr auto auto auto; gap:10px; align-items:center;
}
.name{ font-weight:700; }
.stars{ color:#ffaa00; font-size:14px; letter-spacing:2px; }
.date{ color:#999; font-size:12px; }
.del{ background:transparent; border:none; cursor:pointer; font-size:16px; opacity:.85; }
.del:hover{ opacity:1; }

.comment{ margin-top:6px; line-height:1.6; white-space:pre-wrap; }

.pager{ display:flex; justify-content:center; align-items:center; gap:6px; margin-top:18px; }
.pg{
  min-width:32px; height:28px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer;
}
.pg.active{ background:#eef2ff; border-color:#c7d2fe; font-weight:700; }
.pg:disabled{ opacity:.4; cursor:not-allowed; }

.loading,.empty{ padding:24px; text-align:center; color:#666; }
</style>
