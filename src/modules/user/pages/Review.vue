<!-- src/pages/Review.vue -->
<template>
  <section class="review-wrap">
    <!-- Header -->
    <div class="header-row">
      <div class="chip">
        <span class="th">รีวิว</span>
        <span class="en">Review</span>
      </div>

      <div class="header-actions">
        <button class="write-btn" @click="showModal = true">แสดงความคิดเห็น</button>
      </div>
    </div>

    <!-- Filter / Pills -->
    <div class="filters">
      <button
        class="pill"
        :class="{ active: selected === 'all' }"
        @click="setFilter('all')"
      >
        ความคิดเห็นทั้งหมด ({{ totalCount }})
      </button>

      <button
        v-for="n in [5,4,3,2,1]"
        :key="n"
        class="pill"
        :class="{ active: selected === n }"
        @click="setFilter(n)"
      >
        {{ n }} ดาว ({{ counts[n] || 0 }})
      </button>
    </div>

    <!-- Review Cards -->
    <div class="cards">
      <div class="card" v-for="(rv, idx) in pagedReviews" :key="idx">
        <div class="card-head">
          <div class="avatar">{{ initials(rv.name) }}</div>
          <div class="meta">
            <div class="name">{{ rv.name }}</div>
            <div class="date">{{ rv.date }}</div>
          </div>
          <div class="stars">
            <span
              v-for="i in 5"
              :key="i"
              :class="['star', { on: i <= rv.rating }]"
              >★</span
            >
          </div>
        </div>

        <p class="text">
          {{ rv.text }}
        </p>
      </div>

      <!-- No data -->
      <div v-if="pagedReviews.length === 0" class="empty">
        ยังไม่มีความคิดเห็นในตัวกรองนี้
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="pages > 1">
      <button class="pg" :disabled="page===1" @click="page--">‹</button>
      <button
        class="pg"
        v-for="p in pages"
        :key="p"
        :class="{ active: page === p }"
        @click="page = p"
      >
        {{ p }}
      </button>
      <button class="pg" :disabled="page===pages" @click="page++">›</button>
    </div>

    <!-- Modal -->
    <ReviewModal v-model:open="showModal" />
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ReviewModal from '../components/ReviewModal.vue'

/**
 * MOCK DATA — เปลี่ยนเป็นข้อมูลจาก API ได้ภายหลัง
 * ฟอร์แมตรองรับภาษาไทยเต็มรูปแบบ (Sarabun)
 */
const allReviews = ref([
  {
    name: 'สมชาย ใจดี',
    date: '12 ก.ย. 2568 • 13:20',
    rating: 5,
    text:
      'ห้องสะอาด อุปกรณ์พร้อมใช้งาน ระบบจองง่ายและรวดเร็ว แนะนำให้ใช้ห้อง A-302 สำหรับประชุมเกิน 10 คน',
  },
  {
    name: 'วิภา รื่นรมย์',
    date: '11 ก.ย. 2568 • 09:05',
    rating: 4,
    text:
      'แอร์เย็นดี เงียบ เป็นส่วนตัว แต่ปลั๊กไฟบางจุดหลวมเล็กน้อย โดยรวมโอเคค่ะ',
  },
  {
    name: 'อดิศักดิ์ ชาญฉลาด',
    date: '09 ก.ย. 2568 • 16:48',
    rating: 3,
    text:
      'ห้องเพียงพอสำหรับอ่านหนังสือเป็นกลุ่ม 3-4 คน แต่อินเทอร์เน็ตช้าช่วงบ่าย',
  },
  {
    name: 'กชกร วัฒนะ',
    date: '07 ก.ย. 2568 • 10:10',
    rating: 5,
    text:
      'เจ้าหน้าที่บริการดีมาก จองผ่านมือถือสะดวก พื้นที่สะอาดเรียบร้อย',
  },
  {
    name: 'ปธานิน พูนสุข',
    date: '05 ก.ย. 2568 • 14:22',
    rating: 2,
    text:
      'วันนั้นไมค์มีเสียงจี่ ๆ ต้องเรียกเจ้าหน้าที่มาช่วยแก้ แต่ก็แก้ให้เร็ว',
  },
  {
    name: 'ทิชา ใส่ใจ',
    date: '02 ก.ย. 2568 • 08:55',
    rating: 4,
    text:
      'ระบบจองชัดเจน มีการยืนยันเวลาทางอีเมล สถานที่หาง่าย ที่จอดรถพอมีบ้าง',
  },
])

const showModal = ref(false)
const selected = ref('all') // 'all' | 1..5
const page = ref(1)
const pageSize = 3

const counts = computed(() => {
  const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  allReviews.value.forEach((r) => (c[r.rating]++))
  return c
})

const totalCount = computed(() => allReviews.value.length)

const filtered = computed(() => {
  if (selected.value === 'all') return allReviews.value
  return allReviews.value.filter((r) => r.rating === selected.value)
})

const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const pagedReviews = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch(selected, () => (page.value = 1))

const setFilter = (val) => {
  selected.value = val
}

const initials = (fullName) => {
  const parts = String(fullName).trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0] || 'ผ'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}
</script>

<style scoped>
/* -------- Base / Container -------- */
.review-wrap {
  font-family: 'Sarabun', system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue',
    Arial, 'Noto Sans Thai', sans-serif;
  background: #faf7f2; /* ครีมอ่อนตามภาพ */
  padding: 28px;
  border-radius: 24px;
  max-width: 980px;
  margin: 24px auto 40px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.04);
}

/* -------- Header -------- */
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  background: #fff;
  border: 1px solid #eee5d9;
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.chip .th {
  font-weight: 700;
  color: #1f2937;
  font-size: 18px;
}
.chip .en {
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.write-btn {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}
.write-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.06);
}

/* -------- Filters (Pills) -------- */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}
.pill {
  background: #ffffff;
  border: 1.5px solid #e9e1d7;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: 0.2s ease;
}
.pill:hover {
  border-color: #d6c7b4;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}
.pill.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

/* -------- Cards -------- */
.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.card {
  background: #ffffff;
  border: 1px solid #ede7de;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.card-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f3f4f6;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.meta .name {
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}
.meta .date {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.stars {
  white-space: nowrap;
  user-select: none;
}
.star {
  font-size: 18px;
  color: #d1d5db; /* เทาอ่อน (ดาวว่าง) */
  margin-left: 2px;
}
.star.on {
  color: #f5b301; /* ทอง */
}

.text {
  color: #374151;
  line-height: 1.7;
  margin: 6px 2px 4px;
}

/* -------- Pagination -------- */
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
}
.pg {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}
.pg:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}
.pg:disabled {
  opacity: 0.4;
  cursor: default;
}
.pg.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

/* -------- Responsive -------- */
@media (max-width: 768px) {
  .review-wrap {
    padding: 18px;
    border-radius: 18px;
  }
  .chip {
    padding: 8px 12px;
  }
  .write-btn {
    padding: 8px 12px;
  }
  .card-head {
    grid-template-columns: auto 1fr;
    row-gap: 6px;
  }
  .stars {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>
