<template>
  <div class="search">
    <div class="search-wrapper">
      <input
        class="input-search"
        v-model="keyword"
        @input="filterContent"
        type="text"
        placeholder="請輸入關鍵字"
      />
       <!-- 按鈕換成 PNG 搜尋圖示 -->
      <button class="search-btn" @click="filterContent">
        <img src="https://res.cloudinary.com/dfrjrvt44/image/upload/v1769574308/search_dfatie.png" alt="搜尋" class="search-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const keyword = ref('');
const emit = defineEmits(['search']);

const filterContent = () => {
  emit('search', keyword.value);
};
</script>

<style scoped>
/* 外層對齊 */
.search {
  width: 80%;
  margin: 20px auto;
  display: flex;
  justify-content: flex-end;
}

/* 搜尋框容器 */
.search-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

/* 輸入框 */
.input-search {
  padding: 8px 12px;
  width: 220px;
  border: none;
  outline: none;
}

/* 搜尋按鈕 */
.search-btn {
  background: #eee;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
}

.search-btn:hover {
  background: #ddd;
}

/* PNG 圖示尺寸 */
.search-icon {
  width: 18px;
  height: 18px;
}
</style>
