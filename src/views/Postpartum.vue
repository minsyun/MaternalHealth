<template>
  <div class="postpartum-page">
    <div class="page-header">
      <h2>產後衛教資訊</h2>
      <SearchBar @search="handleSearch" />
    </div>

    <div class="main-layout">
      <div class="content-area">
        <!-- 查有搜尋結果 -->
        <template v-if="hasResult">
          <div v-for="section in filteredSections"
            :key="section.id"
            :id="section.id"
            class="info-section"
          >
            <div class="section-title-box">
              <h3>{{ section.title }}</h3>
              <div class="underline"></div>   
            </div> 
            
            <div class="scroll-box">
              <ul class="link-list">
                <li v-for="(item, index) in section.items" :key="index">            
                  <a :href="item.link" target="_blank" class="resource-link">              
                    {{ item.name }}
                  </a>           
                </li>        
              </ul>       
            </div>    
          </div>
        </template>
        <!-- 查無搜尋結果 -->
        <div v-else class="no-result">
          <img src="https://res.cloudinary.com/dfrjrvt44/image/upload/v1769574328/no-result_gtetqp.png" alt="" />
          <p>查無搜尋結果</p>
        </div>
      </div>

      <aside v-if="!keyword" class="sidebar">
        <div class="toc-container">
          <h4 class="toc-title">目錄</h4>
          <nav>
            <ul>
              <li v-for="section in sections" :key="section.id">
                <a
                  href="#"
                  @click.prevent="scrollToSection(section.id)"
                  class="toc-link">
                
                  {{ section.title }}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  </div>
  <ScrollTop />
</template>

<script setup>
import { ref } from "vue";
import SearchBar from "../components/SearchBar.vue";
import ScrollTop from "../components/ScrollTop.vue";
// 引入 JSON 資料
import postpartumData from "../assets/data/postpartumData.json";
const sections = ref(postpartumData);

// 平滑捲動功能
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    // 扣除 header 高度 (假設 80px)，避免標題被遮住
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

/* --- 搜尋結果用資料 --- */
const filteredSections = ref([...sections.value]); // 初始化顯示原始內容
const hasResult = ref(true);
const keyword = ref("");
/* --- 搜尋功能 --- */
const handleSearch = (key) => {
  keyword.value = key; // 記錄目前搜尋文字
  const kw = key.trim().toLowerCase();

  if (!kw) {
    // 清空搜尋 → 回原始資料
    filteredSections.value = [...sections.value];
    hasResult.value = true;
    return;
  }

  // 搜尋是否任何 item 包含關鍵字
  const result = sections.value
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => item.name.toLowerCase().includes(kw)),
    }))
    .filter((sec) => sec.items.length > 0);

  filteredSections.value = result;
  hasResult.value = result.length > 0;
};
</script>

<style scoped>
/* 頁面基本設定 */
.postpartum-page {
  width: 65%;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  background-color: #f9fbfd; /* 整個頁面給一個底色 */
  min-height: 100vh; /* 確保背景色填滿 */
}

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
  font-weight: bold;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0;
}

/* 主佈局：Flexbox 左右分割 */
.main-layout {
  display: flex;
  gap: 40px; /* 內容區與目錄區的間距 */
  position: relative;
}

/* 左側內容區 */
.content-area {
  flex: 1; /* 佔據剩餘空間 */
  min-width: 0; /* 防止 flex item 溢出 */
}

/* 單個資訊區塊樣式 */
.info-section {
  display: flex; /* 讓標題和內容框並排 */
  align-items: flex-start;
  margin-bottom: 50px;
  gap: 20px;
}

/* 左側標題樣式 */
.section-title-box {
  width: 120px;
  flex-shrink: 0;
  text-align: center;
  padding-top: 10px;
}

.section-title-box h3 {
  color: #2c3e50; 
  font-weight: bold;
  margin: 0 0 5px 0;
  font-weight: 500;
}

.underline {
  height: 2px;
  background-color: #8faec6;
  width: 100%;
}

/* 右側捲動框樣式 */
.scroll-box {
  flex-grow: 1;
  height: 240px; /* 固定高度 */
  overflow-y: auto; /* 超出則捲動 */
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 5px;
  /* 自訂捲軸樣式 (Chrome/Safari) */
  scrollbar-width: thin;
  scrollbar-color: #ccc #f0f0f0;
  box-sizing: border-box;
}

.scroll-box::-webkit-scrollbar {
  width: 8px;
}
.scroll-box::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

/* 連結列表樣式 */
.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  margin-bottom: 0;
  padding-bottom: 8px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.link-list li:last-child {
  border-bottom: none;
}

.resource-link {
  text-decoration: none;
  color: #555;
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  display: block; /* 讓整行可點 */
}

.resource-link:hover {
  color: #3498db;
}

/* --- 右側目錄區 (Sticky Sidebar) --- */
.sidebar {
  width: 200px;
  flex-shrink: 0;
}

.toc-container {
  position: sticky; /* 關鍵：黏性定位 */
  top: 100px; /* 距離頂部的距離 */
  background-color: #e3e9ef; /* 淡藍灰色背景 */
  padding: 20px;
  border-radius: 4px;
}

.toc-title {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #555;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.toc-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-container li {
  margin-bottom: 15px;
}

.toc-link {
  text-decoration: none;
  color: #3498db; /* 連結藍色 */
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  border-bottom: 1px solid transparent;
}

.toc-link:hover {
  color: #1e6091;
  border-bottom-color: #1e6091;
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

/* --- 平板尺寸 (Tablet: 768px ~ 1024px) --- */
@media (max-width: 1024px) {
  .postpartum-page {
    width: 95%; /* 增加寬度佔比 */
    padding: 15px;
  }
  
  .main-layout {
    gap: 20px; /* 縮小左右間距 */
  }

  .page-header h2 {
    white-space: nowrap; /* 強制文字不換行 */
    flex-shrink: 0;      /* 防止標題被右邊的搜尋框擠壓收縮 */
    font-size: 24px;     /* 稍微縮小字體，讓空間更餘裕 */
    margin-right: 20px;  /* 確保跟搜尋框保持距離 */
  }

  .sidebar {
    width: 180px; /* 稍微縮小側邊欄 */
  }

  .section-title-box {
    width: 100px; /* 稍微縮小標題區 */
  }
}

/* --- 手機尺寸 (Mobile: < 768px) --- */
@media (max-width: 768px) {
  .postpartum-page {
    width: 100%;
    padding: 15px 10px;
    box-sizing: border-box;
  }

  /* Header 垂直排列 */
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    margin-bottom: 20px;
  }
  
  h2 {
    text-align: center;
    font-size: 24px;
  }

  .main-layout {
    display: flex;
    flex-direction: column-reverse; 
    gap: 30px; /* 目錄跟下方內容的距離 */
  }

  /* 目錄區調整 */
  .sidebar {
    width: 100%;
    margin: 0;
  }

  .toc-container {
    position: static; /* 手機版不需要黏性定位，讓它自然捲動 */
    padding: 15px;
    background-color: #eef3f7;
    border-radius: 8px;
  }

  .toc-container ul {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 一行兩個 */
    gap: 10px; /* 按鈕之間的間距 */
  }
  
  .toc-container li {
    margin: 0;
  }

  /* 內容區塊調整 */
  .info-section {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 40px;
  }

  .section-title-box {
    width: 100%;
    text-align: left;
    padding-top: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .section-title-box h3 {
    font-size: 18px;
    font-weight: bold;
    border-left: 5px solid #8faec6;
    padding-left: 10px;
  }

  .underline {
    display: none;
  }

  .scroll-box {
    width: 100%;
    height: auto;
    max-height: 300px;
  }
}
</style>
