<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">產檢衛教資訊</h2>
      <SearchBar @search="handleSearch" />
    </div>

    <div v-if="hasResult" class="content-container">
      
      <section v-if="filteredPrenatalData.length > 0" class="prenatal-list">
        <div 
          v-for="(item, index) in filteredPrenatalData" 
          :key="item.id" 
          class="accordion-item"
        >
          <div 
            class="accordion-header" 
            :class="{ 'active': item.isOpen }" 
            @click="toggleAccordion(index)"
          >
            <div class="icon-box">
              <span class="arrow" :class="{ 'rotated': item.isOpen }">▶</span>
            </div>
            <span class="week-title">{{ item.week }}</span>
            <span class="dropdown-arrow" :class="{ 'rotated': item.isOpen }">▼</span>
          </div>

          <transition name="slide-fade">
            <div v-show="item.isOpen" class="accordion-content">
              
              <div v-if="item.subItems" class="sub-items-container">
                <div v-for="(sub, idx) in item.subItems" :key="idx" class="sub-item-row">
                  <div class="sub-item-text">
                    {{ sub.title }}
                  </div>
                  <a :href="sub.url" target="_blank" class="info-link-mini">
                    相關詳細資訊 ➜
                  </a>
                </div>
              </div>

              <div v-else>
                <div class="content-row">
                  <p class="content-text">{{ item.content }}</p>
                  <a v-if="item.link" :href="item.link" target="_blank" class="info-link">
                    相關詳細資訊 ➜
                  </a>
                </div>
                <p v-if="item.note" class="content-note">{{ item.note }}</p>
              </div>

            </div>
          </transition>
        </div>
      </section>

      <hr v-if="filteredPrenatalData.length > 0 && filteredVaccineData.length > 0"  class="divider" />
      
      <section v-if="filteredVaccineData.length > 0" class="info-section">
        <div class="section-label">孕期疫苗</div>
        <div class="section-body">
          <div v-for="vaccine in filteredVaccineData" :key="vaccine.id" class="vaccine-item">
            <span class="vaccine-name">{{ vaccine.name }}</span>
            <span class="vaccine-time">{{ vaccine.time }}</span>
            <p class="vaccine-desc" v-if="vaccine.desc">{{ vaccine.desc }}</p>
          </div>
        </div>
      </section>

    </div>

    <div v-else class="no-result">
      <img src="https://res.cloudinary.com/dfrjrvt44/image/upload/v1769574328/no-result_gtetqp.png" alt="" />
      <p>查無搜尋結果</p>
    </div>
  </div>
  <ScrollTop />
</template>

<script setup>
import { ref } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import ScrollTop from '../components/ScrollTop.vue';
// 引入 JSON 檔案
import prenatalJson from '../assets/data/prenatalData.json';
import vaccineJson from '../assets/data/vaccineData.json';

const prenatalData = ref(prenatalJson);
const vaccineData = ref(vaccineJson);

const filteredPrenatalData = ref([...prenatalData.value]);
const filteredVaccineData = ref([...vaccineData.value]);
const hasResult = ref(true);
const keyword = ref('');

// 切換手風琴開關
const toggleAccordion = (index) => {
  filteredPrenatalData.value[index].isOpen = !filteredPrenatalData.value[index].isOpen;
};

// 搜尋功能 
const handleSearch = (key) => {
  keyword.value = key;
  const kw = key.trim().toLowerCase();

  if (!kw) {
    filteredPrenatalData.value = [...prenatalData.value];
    filteredVaccineData.value = [...vaccineData.value];
    hasResult.value = true;
    return;
  }

  const prenatalResult = prenatalData.value.filter(item => {
    if (item.week.toLowerCase().includes(kw)) return true;
    if (item.content && item.content.toLowerCase().includes(kw)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => sub.title.toLowerCase().includes(kw));
    }
    return false;
  });

  const vaccineResult = vaccineData.value.filter(vaccine => 
    vaccine.name.toLowerCase().includes(kw) ||
    vaccine.time.toLowerCase().includes(kw) ||
    (vaccine.desc && vaccine.desc.toLowerCase().includes(kw))
  );

  filteredPrenatalData.value = prenatalResult;
  filteredVaccineData.value = vaccineResult;
  hasResult.value = prenatalResult.length > 0 || vaccineResult.length > 0;
};
</script>

<style scoped>
/* --- 全域變數概念 (CSS Variables) --- */
.page-container {
  --primary-color: #6fa3d4;       /* 主色調：柔和藍 */
  --accent-color: #4a5568;        /* 強調色：溫暖黃 (用於箭頭或重點) */
  --bg-color: #f9fbfd;            /* 背景色：極淡的藍灰色 */
  --card-bg: #ffffff;             /* 卡片背景：純白 */
  --text-main: #4a5568;           /*主要文字：深灰 */
  --text-light: #718096;          /* 次要文字：淺灰 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-hover: 0 8px 16px rgba(111, 163, 212, 0.15);
  --radius: 12px;                 /* 圓角大小 */
}

/* 容器設定 */
.page-container {
  width: 65%; 
  margin: 0 auto;
  padding: 20px;
  color: #4a5568; 
  background-color: #f9fbfd; /* 整個頁面給一個底色 */
  min-height: 100vh; /* 確保背景色填滿 */
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* Header */
.page-header {
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #ffffff, #f0f4f8); /* 標題區塊微漸層 */
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);;
}

h2 {
  font-size: 28px;
  color: #2c3e50;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0;
}

/* --- 產檢衛教列表 (手風琴) --- */
.prenatal-list {
  width: 100%;
  margin-bottom: 40px;
}

.accordion-item {
  margin-bottom: 18px;
  border-radius: 12px; 
  background-color: transparent;
}

/* Header 樣式 - 卡片化 */
.accordion-header {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 18px;
  padding: 18px 25px;
  
  background-color: var(--card-bg);
  border: 1px solid transparent; /* 預留邊框位置 */
  border-radius: 12px; 
  box-shadow: var(--shadow-sm);
  
  position: relative;
  overflow: hidden; /* 讓左側色條不溢出圓角 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 左側裝飾條 (預設隱藏或淡色) */
.accordion-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background-color: #e2e8f0; /* 未選中時是灰色 */
  transition: background-color 0.3s ease;
}

/* Hover 效果：浮起 + 陰影加深 */
.accordion-header:hover {
  /* transform: translateY(-2px); */
  box-shadow: var(--shadow-hover);
  border-color: #e2e8f0;
}

.accordion-header:hover::before {
  background-color: var(--primary-color); /* Hover 時變色 */
}

/* Active (展開) 狀態 */
.accordion-header.active {
  background-color: #ffffff; 
  /* 讓下面圓角變直，接合內容 */
  border-radius: var(--radius) var(--radius) 0 0; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.03);
  border-bottom: 1px dashed #edf2f7;
}

.accordion-header.active::before {
  background-color: var(--primary-color); /* 展開時維持藍色 */
}

/* Icon Box */
.icon-box {
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #eff6ff; /* 淡藍色圓底 */
  border-radius: 50%;
  flex-shrink: 0; /* 防止被擠壓 */
}

.arrow {
  font-size: 12px;
  color: var(--primary-color);
  transition: transform 0.3s ease;
  margin-left: 2px; /* 視覺修正 */
}

/* .arrow.rotated {
  transform: rotate(90deg);
} */

.week-title {
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

/* 右側下拉箭頭 */
.dropdown-arrow {
  margin-left: auto;
  font-size: 12px;
  color: #cbd5e0;
  transition: transform 0.3s ease, color 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
  color: var(--primary-color);
}

/* 展開內容區塊 */
.accordion-content {
  padding: 25px 30px;
  background-color: #ffffff;
  color: var(--text-main);
  line-height: 1.7;
  
  /* 只圓下方 */
  border-radius: 0 0 var(--radius) var(--radius);
  box-shadow: 0 4px 8px rgba(0,0,0,0.03); 
  margin-top: 0; /* 接合 Header */
  border-top: none;
  position: relative;
  z-index: 0;
}

.content-text {
  margin-bottom: 0;          /* 移除原本的下邊距，改由 row 控制 */
  flex: 1;                   /* 讓文字佔據剩餘空間 */
  text-align: justify;       /*  讓多行文字排版較整齊 */
}

.content-note {
  font-size: 14px;
  color: #e53e3e; /* 警示紅，但柔和點 */
  background-color: #fff5f5;
  padding: 10px 15px;
  border-radius: 8px;
  border-left: 4px solid #fc8181;
}

/* --- 連結按鈕優化 --- */
.info-link, .info-link-mini {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
  justify-content: center; /* 確保內容置中 */
}

.link-container {
  margin-top: 15px;
  text-align: right; /* 按鈕靠右 */
  padding-right: 20px;
}

/* 大按鈕 */
.content-row {
  display: flex;             /* 啟用彈性盒模型 */
  justify-content: space-between; /* 左右推開：文字在左，按鈕在右 */
  align-items: center;       /* 垂直置中對齊 */
  gap: 20px;                 /* 文字與按鈕之間的間距 */
  margin-bottom: 15px;       /* 取代原本 content-text 的 margin */
}

.info-link {
  /* 藍色字、藍色框、透明底 */
  color: #57aee2;
  border: 1px solid #57aee2;
  background-color: transparent;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  box-shadow: none; 
  flex-shrink: 0;            /* 禁止按鈕被壓縮 */
  white-space: nowrap;       /* 確保文字不換行 */
  padding: 6px 14px; /* 稍微增加高度方便點擊 */
}

/* 大按鈕 Hover 效果：填滿顏色 */
.info-link:hover {
  background-color: #83c3e8;  
  color: white;               
  border-color: #83c3e8;     
  
  /* 浮起與陰影 */
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(131, 195, 232, 0.4);
}

/* 小按鈕 */
.info-link-mini {
  color: #57aee2;
  border: 1px solid #57aee2;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  background-color: transparent;
}

.info-link-mini:hover {
  background-color: #83c3e8;
  color: white;
}

.sub-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #edf2f7;
  gap: 15px; /* 增加間距 */
}

/* --- 分隔線 --- */
.divider {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, transparent, #cbd5e0, transparent);
  margin: 50px 0;
}

/* --- 疫苗區塊優化 (卡片格狀排列) --- */
.info-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
}

.section-label {
  font-size: 24px;
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 25px;
  padding-left: 15px;
  border-left: 5px solid var(--accent-color); /* 黃色標籤 */
  line-height: 1;
}

.section-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 自動排版 RWD */
  gap: 20px;
}

.vaccine-item {
  background-color: #ffffff;
  padding: 20px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid #f1f1f1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.vaccine-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  border-color: #bee3f8;
}

/* 疫苗卡片頂部裝飾條 */
.vaccine-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6fa3d4, #81e6d9);
}

.vaccine-name {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.vaccine-time {
  display: inline-block;
  font-size: 13px;
  color: #2c5282;
  background-color: #ebf8ff;
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-weight: 600;
  margin-left: 0; /* Reset */
}

.vaccine-desc {
  font-size: 14px;
  color: var(--text-light);
  line-height: 1.5;
  margin: 0;
}

/* No Result */
.no-result {
  width: 100%;
  text-align: center;
  margin-top: 100px;
  color: #b56b6b;
  font-size: 22px;
  font-weight: bold;
}

.no-result img {
  width: 120px;
  opacity: 0.8;
  margin-bottom: 20px;
}

/* Vue Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  max-height: 800px; /* 增加高度以防截斷 */
  opacity: 1;
  overflow: hidden;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* --- RWD --- */
/* 平板 (iPad Air, iPad Mini) & 窄螢幕筆電 
   範圍: 768px ~ 1180px 
*/
@media (max-width: 1180px) {
  .page-container {
    width: 90%; /* 加寬版面，iPad 上閱讀更舒適 */
    padding: 30px 20px;
  }
  .page-header h2 {
    white-space: nowrap; /* 強制文字不換行 */
    flex-shrink: 0;      /* 防止標題被右邊的搜尋框擠壓收縮 */
    font-size: 24px;     /* 稍微縮小字體，讓空間更餘裕 */
    margin-right: 20px;  /* 確保跟搜尋框保持距離 */
  }
}

/* 手機版 (iPhone 12 Pro, 14 Pro Max) 
   範圍: 768px 以下 
*/
@media (max-width: 768px) {
  .page-container {
    width: 100%; /* 手機版滿寬 */
    padding: 10px 15px; /* 縮小邊距 */
    box-sizing: border-box;
  }
  
  /* Header 區塊 */
  .page-header {
    flex-direction: column; /* 垂直排列 */
    align-items: stretch;   /* 讓搜尋框寬度填滿 */
    gap: 15px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .page-header h2 {
    font-size: 24px;
    text-align: center;
  }
  
  /* 疫苗區塊：確保手機上是單欄顯示 */
  .section-body {
    grid-template-columns: 1fr; 
  }
  
  /* 手風琴 Header */
  .accordion-header {
    padding: 15px; /* 減少內距 */
    font-size: 16px; /* 字體微縮 */
  }
  
  .week-title {
    font-size: 1rem;
  }
  
  /* 手風琴內容區 */
  .accordion-content {
    padding: 20px 15px; /* 左右空間縮小 */
  }

  /* 手機版文字與按鈕的排列 */
  .content-row {
    flex-direction: column; 
    align-items: flex-start; /* 文字靠左 */
    gap: 12px;
  }
  
  .content-text {
    width: 100%;
  }

  /* 2. 修改按鈕樣式：改為適應寬度並靠右 */
  .info-link {
    width: auto;           /* 改回自動寬度 (不強制 100%) */
    align-self: flex-end;  /* 讓按鈕靠右對齊 */
    margin-top: 5px;
    box-sizing: border-box; /* 確保邊框計算正確 */
  }

  /* 子項目的 RWD 處理 */
  .sub-item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .info-link-mini {
    align-self: flex-end; /* 小按鈕靠右 */
  }
}
</style>
