<template>
  <div id="review-section" class="review-container">
    <h2>รีวิว <span style="color:#3448c5">Review</span></h2>

    <!-- ปุ่มกรอง -->
    <div class="filter-box">
      <button>ความคิดเห็นทั้งหมด</button>
      <button>5 ดาว (210)</button>
      <button>4 ดาว (10)</button>
      <button>3 ดาว (15)</button>
      <button>2 ดาว (35)</button>
      <button>1 ดาว (3)</button>
      <button class="add-review">แสดงความคิดเห็นที่นี่</button>
    </div>

    <!-- รายการรีวิว -->
    <div class="review-item" v-for="n in 4" :key="n">
      <div class="user">
        <span>👤 รินรำไพร แสนค่า</span>
        <div class="stars">⭐️⭐️⭐️⚪⚪</div>
        <small>2024-10-24 13:40</small>
      </div>
      <p>ห้องสะอาดและเก็บเสียงดีมากๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆๆ</p>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button>&lt;</button>
      <button class="active">1</button>
      <button>2</button>
      <button>3</button>
      <button>4</button>
      <span>...</span>
      <button>&gt;</button>
    </div>
  </div>
</template>

<style scoped>
.review-container {
  padding: 20px;
}
.filter-box {
  background: #fff3e6;
  padding: 10px;
  margin-bottom: 20px;
}
.filter-box button {
  margin: 5px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  cursor: pointer;
}
.add-review {
  border: 1px solid #3448c5;
  color: #3448c5;
  background: #fff;
}
.review-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}
.stars {
  font-size: 14px;
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
.pagination button {
  margin: 0 5px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
}
.pagination .active {
  background: #3448c5;
  color: white;
}
</style>
