<script setup>
<<<<<<< Updated upstream
import { computed, onMounted, ref, watch } from "vue";
import { useAuthStore } from "@/store/auth";
import { getMyActiveBooking, cancelMyBooking } from "@/services/api";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["update:open", "close"]);

const auth = useAuthStore();

const loading = ref(false);
const hasBooking = ref(false);
const booking = ref(null); // { id, room_code, start_at, end_at, members: [], room_type_name? }
const errorMsg = ref("");

function close() {
  emit("update:open", false);
  emit("close");
}

async function fetchActive() {
  loading.value = true;
  errorMsg.value = "";
  hasBooking.value = false;
  booking.value = null;
  try {
    const { data } = await getMyActiveBooking();
    hasBooking.value = !!data?.id;
    booking.value = data || null;
  } catch (err) {
    // 404 = ไม่มีการจอง
    if (err?.response?.status === 404) {
      hasBooking.value = false;
      booking.value = null;
    } else {
      errorMsg.value = err?.response?.data?.message || "เกิดข้อผิดพลาด";
    }
  } finally {
    loading.value = false;
  }
}

async function handleCancel() {
  if (!booking.value?.id) return;
  if (!confirm("ต้องการยกเลิกการจองนี้ใช่หรือไม่?")) return;
  try {
    await cancelMyBooking(booking.value.id);
    alert("ยกเลิกการจองเรียบร้อย");
    close();
  } catch (err) {
    alert(err?.response?.data?.message || "ยกเลิกไม่สำเร็จ");
  }
}

// ดึงข้อมูลทุกครั้งที่เปิด
watch(
  () => props.open,
  (v) => {
    if (v) fetchActive();
  }
);

const displayName = computed(() => auth.displayName || "-");
const studentId = computed(() => auth.studentId || "-");
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="close">
      <div class="modal-card">
        <template v-if="loading">
          <div class="loading">กำลังโหลด...</div>
        </template>

        <template v-else>
          <!-- กรณี error -->
          <div v-if="errorMsg" class="error-text">{{ errorMsg }}</div>

          <!-- ยังไม่เคยจอง -->
          <div v-if="!hasBooking && !errorMsg" class="state not-found">
            <div class="icon cross">✕</div>
            <h2>หลักฐานการจองห้องสมุด</h2>
            <p>ยังไม่ได้จอง</p>
            <button class="btn ok" @click="close">ยืนยัน</button>
          </div>

          <!-- มีการจอง -->
          <div v-else-if="hasBooking && booking" class="state found">
            <div class="icon check">✓</div>
            <h2>หลักฐานการจองห้องสมุด</h2>
            <h3>การจองเสร็จสิ้น</h3>

            <div class="kv">
              <span class="k">ห้องที่ทำการจอง :</span>
              <span class="v">{{ booking.room_code }}</span>
            </div>

            <div class="group">
              <h4>ชื่อผู้จอง</h4>
              <div class="kv">
                <span class="k">ชื่อ :</span>
                <span class="v">{{ displayName }}</span>
                <span class="k">รหัสนิสิต :</span>
                <span class="v">{{ studentId }}</span>
              </div>
            </div>

            <div class="group">
              <h4>รหัสนิสิตผู้ร่วมจอง</h4>
              <ul class="members">
                <li v-for="(m, idx) in booking.members" :key="idx">
                  รหัสนิสิตคนที่ {{ idx + 1 }} : {{ m }}
                </li>
              </ul>
            </div>

            <div class="actions">
              <button class="btn danger" @click="handleCancel">
                ยกเลิกการจอง
              </button>
              <button class="btn ok" @click="close">ยืนยัน</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal-card {
  width: min(720px, 92vw);
  background: #eaf0ff; /* โทนฟ้าอ่อนคล้ายภาพตัวอย่าง */
  border-radius: 20px;
  padding: 28px 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
.state {
  text-align: center;
}
.icon {
  font-size: 56px;
  margin-bottom: 12px;
}
.icon.cross {
  color: #ef4444;
}
.icon.check {
  color: #10b981;
}

.kv {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 8px 0 16px;
}
.k {
  font-weight: 600;
}
.v {
  font-weight: 700;
}

.group {
  margin: 14px 0;
}
.group h4 {
  margin: 8px 0;
  font-weight: 700;
}

.members {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
}
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn {
  border: none;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 700;
}
.btn.ok {
  background: #86efac;
}
.btn.danger {
  background: #ef4444;
  color: #fff;
}
.loading {
  text-align: center;
  padding: 24px;
}
.error-text {
  color: #ef4444;
  text-align: center;
  margin-bottom: 10px;
}
=======
const props = defineProps({
  modelValue: Boolean,
  empty: Boolean,
  proof: Object,
});
const emit = defineEmits(["update:modelValue", "cancel"]);
const close = () => emit("update:modelValue", false);
</script>

<template>
  <div v-if="modelValue" class="backdrop">
    <div class="card">
      <!-- แบบยังไม่เคยจอง -->
      <div v-if="empty" class="empty">
        <div class="icon">✖</div>
        <h2>หลักฐานการจองห้องสมุด</h2>
        <p>ยังไม่ได้จอง</p>
        <button class="btn" @click="close">ยืนยัน</button>
      </div>

      <!-- แบบมีการจอง -->
      <div v-else class="success">
        <div class="icon">✔</div>
        <h2>หลักฐานการจองห้องสมุด</h2>
        <h3>การจองเสร็จสิ้น</h3>

        <p><strong>ห้องที่ทำการจอง :</strong> {{ proof?.room_code }}</p>

        <div class="who">
          <p><strong>ชื่อผู้จอง</strong></p>
          <p>
            ชื่อ : {{ proof?.created_by?.display_name }} &nbsp;&nbsp;รหัสนิสิต :
            {{ proof?.created_by?.student_id }}
          </p>
        </div>

        <div class="members">
          <p><strong>รหัสนิสิตผู้ร่วมจอง</strong></p>
          <p v-for="(sid, i) in proof?.members || []" :key="i">
            รหัสนิสิตคนที่ {{ i + 1 }} : {{ sid }}
          </p>
        </div>

        <div class="actions">
          <button class="btn danger" @click="$emit('cancel', proof?.id)">
            ยกเลิกการจอง
          </button>
          <button class="btn" @click="close">ยืนยัน</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.card {
  background: #eaeffd;
  border-radius: 20px;
  padding: 28px;
  width: min(560px, 92vw);
}
.icon {
  font-size: 56px;
  line-height: 1;
  margin-bottom: 8px;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: #bfe6c6;
}
.danger {
  background: #f25a5a;
  color: #fff;
}
>>>>>>> Stashed changes
</style>
