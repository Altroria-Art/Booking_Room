<script setup>
import { ref, reactive, watch, computed } from "vue";
import { getRoomTypes, createRoom } from "@/services/api";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["update:open", "created"]);

const types = ref([]);

const form = reactive({
  room_type_id: "",
  room_code: "",
});

const loading = ref(false);

function resetForm() {
  form.room_type_id = "";
  form.room_code = "";
}
const close = () => {
  resetForm();
  emit("update:open", false);
};

async function loadTypes() {
  try {
    const r = await getRoomTypes();
    types.value = Array.isArray(r.data) ? r.data : [];
  } catch (e) {
    console.error(e);
    alert("โหลดประเภทห้องไม่สำเร็จ");
  }
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      resetForm();
      loadTypes();
    }
  }
);

const canSubmit = computed(
  () => form.room_type_id !== "" && !!form.room_code.trim()
);

async function onSubmit() {
  if (!canSubmit.value) return alert("กรุณาเลือกประเภทห้องและกรอกรหัสห้อง");
  loading.value = true;
  try {
    await createRoom({
      room_type_id: Number(form.room_type_id),
      room_code: form.room_code.trim(),
    });
    alert("เพิ่มห้องสำเร็จ");
    emit("created"); // ให้หน้าพาเรนต์ reload รายการ
    close();
  } catch (e) {
    console.error(e);
    const msg = e?.response?.data?.message || e.message;
    alert("เพิ่มห้องไม่สำเร็จ: " + msg); // เช่น รหัสห้องซ้ำ
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="backdrop" @click.self="close">
      <div class="sheet">
        <header class="head">
          <h2>
            <span class="hl">เพิ่มห้อง</span><span class="sub">STUDYROOM</span>
          </h2>
        </header>

        <section class="body">
          <label class="label">กรุณาเลือกประเภทห้อง <b>*</b></label>
          <select v-model="form.room_type_id" class="control">
            <option value="">กรุณาเลือกประเภท</option>
            <option v-for="t in types" :key="t.id" :value="String(t.id)">
              {{ t.type_name }}
            </option>
          </select>

          <label class="label">กรุณาใส่เลขห้อง <b>*</b></label>
          <input
            v-model.trim="form.room_code"
            type="text"
            class="control"
            placeholder="ใส่เลขห้อง เช่น CE0208"
          />
        </section>

        <footer class="foot">
          <button
            type="button"
            class="btn success"
            :disabled="!canSubmit || loading"
            @click="onSubmit"
          >
            เพิ่มห้องจอง <span class="badge">＋</span>
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.sheet {
  width: min(520px, 92vw);
  background: #dfe4ff;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  padding: 28px 24px;
}
.head h2 {
  margin: 0 0 12px;
  font-weight: 800;
  font-size: 32px;
}
.hl {
  margin-right: 4px;
}
.sub {
  letter-spacing: 0.5px;
  font-size: 18px;
  opacity: 0.85;
}
.body {
  display: grid;
  gap: 12px;
}
.label {
  font-weight: 600;
  margin-top: 6px;
}
.control {
  width: 100%;
  box-sizing: border-box; /* ทำให้ input/select กว้างเท่ากัน */
  display: block;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
}
select.control {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
.foot {
  margin-top: 18px;
  display: flex;
  gap: 16px;
  justify-content: center;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
.badge {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  font-weight: 900;
}
.success {
  background: #7dfc90;
  color: #111;
} /* เขียวตามปุ่มตัวอย่าง */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
