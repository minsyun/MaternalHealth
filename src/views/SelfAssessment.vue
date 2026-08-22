<template>
  <div class="assessment-page">
    
    <div class="layout-container">
      
      <aside class="sidebar">
        <ul class="menu-list">
          <li v-for="item in menuItems" :key="item.path">
            <router-link 
              :to="item.path" 
              class="menu-link"
              active-class="active"
            >
              {{ item.title }}
            </router-link>
          </li>
        </ul>
      </aside>

      <main class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定義左側選單項目
const menuItems = ref([
  { title: '問卷說明', path: '/self-assessment/instructions' },
  { title: '孕婦產前健康照護衛教指導紀錄表', path: '/self-assessment/prenatal' },
  { title: '愛丁堡產後憂鬱量表', path: '/self-assessment/depression' },
  { title: '歷史填寫紀錄', path: '/self-assessment/history' }
]);
</script>

<style scoped>
.assessment-page {
  width: 65%;
  max-width: 1400px; /* 增加最大寬度限制，避免在超大螢幕太寬 */
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
}

.layout-container {
  display: flex;
  gap: 50px; /* 左右區塊間距 */
  min-height: 600px;
  align-items: flex-start; /* 防止側邊欄被內容撐高 */
}

/* --- 左側側邊欄樣式 --- */
.sidebar {
  width: 250px;
  flex-shrink: 0;
  position: sticky; /* 電腦版讓選單黏在螢幕上方 */
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  /* background: #fff; 
  border-radius: 8px;  */
}

.menu-list li {
  border-bottom: 2px solid #e0e0e0; /* 分隔線 */
}

.menu-link {
  display: block;
  padding: 20px 0;
  text-decoration: none;
  color: #555;
  font-size: 18px;
  line-height: 1.5;
  transition: color 0.3s;
  text-align: center;
  border-left: 4px solid transparent; /* 電腦版用左側線條標示 */
}

.menu-link:hover {
  color: #3498db;
}

/* Vue Router 自動加上的 Active Class */
.menu-link.active {
  color: #3498db;
  font-weight: bold;
}

/* --- 右側內容區框架 --- */
.content-wrapper {
  flex-grow: 1;
  width: 100%; /* 確保內容區塊佔滿剩餘空間 */
  min-width: 0; /* 防止 flex item 破版 */
}

/* 簡單的過場動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- 1. iPad Air / 平板 / 窄螢幕筆電 (範圍: <= 1180px) --- */
@media (max-width: 1180px) {
  .assessment-page {
    width: 90%; /* 寬度拉大，善用平板空間 */
    padding: 30px 20px;
  }

  .layout-container {
    flex-direction: column; /* 改為垂直排列 */
    gap: 20px;
  }

  /* 側邊欄變身為「上方橫向導覽列」 */
  .sidebar {
    width: 100%;
    position: static; /* 取消 sticky */
    overflow-x: auto; /* 允許橫向滑動 */
    background: #fff;
    padding: 5px 0;
    border-bottom: 1px solid #e0e0e0;
    
    /* 隱藏捲軸但保留功能 */
    scrollbar-width: none; 
    -ms-overflow-style: none;
  }
  .sidebar::-webkit-scrollbar {
    display: none;
  }

  .menu-list {
    display: flex; /* 變橫排 */
    width: max-content; /* 讓內容撐開寬度，觸發滑動 */
  }

  .menu-list li {
    border-bottom: none;
    flex-shrink: 0;
  }

  .menu-link {
    padding: 12px 20px;
    font-size: 16px;
    text-align: left;
    white-space: nowrap; /* 文字不換行 */
    border-left: none; /* 移除左側線條 */
    border-bottom: 3px solid transparent; /* 改用底部線條 */
    border-radius: 6px 6px 0 0;
  }

  .menu-link.active {
    border-left-color: transparent;
    border-bottom-color: #3498db;
    background-color: transparent;
    color: #3498db;
  }
}

/* --- 2. 手機版 (iPhone 12 Pro, 14 Pro Max 等) --- */
@media (max-width: 768px) {
  .assessment-page {
    width: 100%; /* 手機滿版 */
    padding: 15px 10px; /* 邊距縮小 */
  }
  
  .menu-link {
    font-size: 15px;
    padding: 10px 15px; /* 按鈕稍微變小 */
  }
  
  /* 讓導覽列在手機上更緊湊 */
  .layout-container {
    gap: 15px;
  }
}
</style>