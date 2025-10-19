<!-- src/components/admin/AdminCancelModal.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  data: { type: Object, default: null },   // { id, room_code, start_at, end_at, start_hhmm, end_hhmm, display_name, created_by, members[] }
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open','close','confirm-cancel'])

const close = () => { emit('update:open', false); emit('close') }
const confirmCancel = () => { if (props.data) emit('confirm-cancel', props.data.id) }

const dateText = computed(() => {
  const d = props.data?.start_at ? new Date(props.data.start_at) : null
  if (!d) return ''
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
})
const timeRange = computed(() => {
  const s = props.data?.start_hhmm || (props.data?.start_at && new Date(props.data.start_at).toTimeString().slice(0,5))
  const e = props.data?.end_hhmm   || (props.data?.end_at   && new Date(props.data.end_at).toTimeString().slice(0,5))
  return s && e ? `${s} - ${e}` : ''
})
const members = computed(() => (props.data?.members ?? []).filter(s => s && s !== props.data?.created_by))
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="overlay" @click.self="close">
      <div class="modal">
        <!-- ไอคอนเช็ค -->
        <div class="check">
          <svg viewBox="0 0 48 48" width="88" height="88" aria-hidden="true">
            <circle cx="24" cy="24" r="21" fill="none" stroke="#16a34a" stroke-width="6"/>
            <path d="M14 25l6 6 14-14" fill="none" stroke="#16a34a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <!-- หัวเรื่อง + วันที่ -->
        <h2 class="title">หลักฐานการจองห้องสมุด</h2>
        <div class="subtitle">
          การจองเสร็จสิ้น <span v-if="dateText">({{ dateText }})</span>
        </div>

        <!-- กำลังโหลด -->
        <div v-if="!data || loading" class="card loading-card">
          กำลังโหลดข้อมูลการจอง…
        </div>

        <!-- รายละเอียด -->
        <div v-else class="card">
          <div class="row">
            <b>ห้องที่ทำการจอง :</b>
            <span>{{ data.room_code }}</span>
          </div>
          <div class="row">
            <b>เวลา :</b>
            <span>{{ timeRange || '-' }}</span>
          </div>

          <div class="section">
            <div class="row row-title"><b>ชื่อผู้จอง</b></div>
            <div class="row">
              <span>ชื่อ : {{ data.display_name || '-' }}</span>
              <span class="spacer"></span>
              <span>รหัสนิสิต : {{ data.created_by }}</span>
            </div>
          </div>

          <div class="section">
            <div class="row row-title"><b>รหัสนิสิตผู้ร่วมจอง</b></div>
            <template v-if="members.length">
              <div class="row" v-for="(sid, i) in members" :key="sid">
                รหัสนิสิตคนที่ {{ i+1 }} : {{ sid }}
              </div>
            </template>
            <div v-else class="row">-</div>
          </div>
        </div>

        <!-- ปุ่ม -->
        <div class="actions">
          <button class="btn danger" :disabled="loading" @click="confirmCancel">
            {{ loading ? 'กำลังยกเลิก…' : 'ยกเลิกการจอง' }}
          </button>
          <button class="btn primary" @click="close">ยืนยัน</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* ฉากหลัง */
.overlay{
  position:fixed; inset:0; background:rgba(0,0,0,.40);
  display:grid; place-items:center; z-index:9999;
}

/* กล่องหลัก – โทน/สัดส่วนให้เหมือนภาพแรก */
.modal{
  width:min(960px, calc(100vw - 36px));          /* แคบลงกว่าของเดิม */
  background:#eef3f9;                             /* ฟ้าอ่อน */
  border-radius:22px;
  padding:22px 26px 24px;
  box-shadow:0 18px 70px rgba(0,0,0,.25);
}
.check{ display:grid; place-items:center; margin-top:4px; }

.title{
  text-align:center;
  font-size:34px;                                  /* ลดให้ใกล้ภาพแรก */
  line-height:1.18;
  margin:10px 0 4px;
  font-weight:800;
  color:#0f172a;
  letter-spacing:.1px;
}
.subtitle{
  text-align:center; color:#6b7280;
  font-size:16px; margin-bottom:8px;
}

/* การ์ดขาวด้านใน – แคบลง + เงาอ่อน */
.card{
  max-width:740px;                                 /* ความกว้างการ์ดใกล้ภาพแรก */
  width:calc(100% - 120px);
  margin:12px auto 0;
  background:#fff;
  border-radius:18px;
  padding:20px 24px;
  box-shadow:0 12px 28px rgba(0,0,0,.10), inset 0 0 0 1px rgba(0,0,0,.04);
}
.loading-card{ text-align:center; font-weight:700; color:#111827; }

/* แถวข้อความ */
.row{
  display:flex; align-items:flex-start; gap:10px;
  font-size:18px; color:#0f172a; margin:8px 0;
  flex-wrap:wrap;
}
.row b{ font-weight:800; }
.row-title{ margin-top:12px; }
.section{ margin-top:6px; }
.spacer{ width:16px; display:inline-block; }

/* ปุ่ม */
.actions{
  display:flex; justify-content:center; gap:22px;
  margin-top:22px;
}
.btn{
  min-width:220px;
  padding:14px 20px;
  border-radius:14px; border:0;
  font-weight:800; font-size:18px;
  box-shadow:0 10px 24px rgba(0,0,0,.14);
  cursor:pointer;
}
.btn.primary{ background:#10b981; color:#fff; }   /* เขียว */
.btn.danger{  background:#ef4444; color:#fff; }   /* แดง */
.btn:disabled{ opacity:.75; cursor:not-allowed; }

@media (max-width:760px){
  .modal{ padding:18px 14px; }
  .title{ font-size:26px; }
  .card{ width:calc(100% - 20px); max-width:none; padding:16px; }
  .row{ font-size:16px; }
  .btn{ min-width:160px; font-size:16px; padding:12px 16px; }
}
</style>
