<template>
  <div class="card-section">
    <h1>{{ title }}</h1>
    <div class="desc" v-for="(segment, index) in desc" :key="index">
      <a 
          v-if="segment.link" 
          :href="segment.link" 
          target="_blank" 
          class="desc-link"
          @click="emitClick(segment)"
        >
          {{ segment.text }}
        </a>
        
        <span v-else :class="{ 'blue-text': segment.isVaccine }">
          {{ segment.text }}
        </span>
    </div>
    <button class="more-btn" @click="$emit('click-more')">更多內容</button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  desc: { type: Array, required: true, default: () => [] }
})

// 宣告要傳給父元件的事件
const emit = defineEmits(['click-more', 'article-click']);

// 當文章連結被點擊時，把該文章的資料 (segment) 往外傳
const emitClick = (segment) => {
  emit('article-click', segment);
};
</script>

<style scoped>
.card-section {
  width: 65%;
  margin: 40px auto;
  background: #fff;
  padding: 20px 30px 70px 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: relative; 
  min-height: 150px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}
h1 {
  color: #3b4a5a;
  margin-bottom: 10px;
}
.desc {
  margin-bottom: 12px; /* 每個連結之間的距離稍微縮小一點，手機看比較緊湊 */
  font-size: 16px;     /* 手機上建議字體不小於 16px 以利閱讀 */
  line-height: 1.6;
  color: #6b6b6b;
  word-wrap: break-word; /* 防止長網址或長英文撐開版面 */
}
/* 連結樣式 */
.desc-link {
  color: #3498db;
  text-decoration: underline; 
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
  margin: 0 2px; /* 連結與文字間稍微留白 */
  display: inline-block;
}

.desc-link:hover {
  color: #1e6091;
}

.blue-text {
  color: #3498db; /* 與連結同色 */
  font-weight: 500; /* 加一點粗度，看起來更明顯 */
}

.more-btn {
  position: absolute;
  bottom: 20px;
  right: 30px;
  border: none;
  background: #fff;
  padding: 10px 24px;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  background-color: #57aee2;
  color: white;
  box-shadow: 0 2px 5px rgba(87, 174, 226, 0.3);
}
.more-btn:hover {
  background-color: #83c3e8;
}

/* 平板 (iPad Air 直立/橫放) & 小型筆電 */
/* 範圍：小於 1024px */
@media (max-width: 1024px) {
  .card-section {
    width: 85%; /* 稍微加寬 */
    padding: 20px 30px 70px 30px;
  }
}

/* 手機 (iPhone 12 Pro, 14 Pro Max 等) */
/* 範圍：小於 768px */
@media (max-width: 768px) {
  .card-section {
    width: 92%; /* 手機版面要佔滿，兩側留一點點空隙即可 */
    margin: 20px auto; /* 上下間距縮小 */
    padding: 20px 20px 65px 20px; /* 左右內距縮小，讓文字空間變大 */
  }

  h1 {
    font-size: 1.3rem; /* 標題稍微縮小 */
  }

  .desc {
    font-size: 15px;
  }

  .more-btn {
    right: 20px; /* 按鈕靠右距離縮小 */
    bottom: 15px;
    padding: 8px 20px; /* 按鈕稍微改小一點點 */
    font-size: 13px;
  }
}
</style>