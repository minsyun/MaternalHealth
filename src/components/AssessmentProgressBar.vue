<template>
  <div class="progress-widget">
        <div class="progress-text">
            填寫進度 : <span class="progress-num">{{ completionRate }} %</span>
        </div>
        <div class="progress-track">
            <div class="progress-fill" :style="{ width: completionRate + '%' }"></div>
        </div>
    </div>
</template>

<script setup>
defineProps({
  completionRate: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
/* --- 進度條組件 (右上角) --- */
.progress-widget {
    position: absolute; /* 絕對定位 */
    right: 25px;           /* 靠右對齊 */
    top: 15px;          
    width: 160px;       /* 設定固定寬度 */
    text-align: center;
}

.progress-text {
    font-size: 16px;
    font-weight: 600;
    color: #4a5568;     
    margin-bottom: 8px; /* 文字與條的間距 */
    letter-spacing: 1px;
}

.progress-num {
    margin-left: 5px;
    font-weight: bold;  
}

/* 進度條軌道 (淺灰底) */
.progress-track {
    width: 100%;
    height: 10px;         
    background-color: #dbe2e8; 
    border-radius: 6px;    
    overflow: hidden;
}

/* 進度條填充 (深灰藍) */
.progress-fill {
    height: 100%;
    background-color: #4f6070; /* 截圖中的深灰藍色 */
    border-radius: 6px;     /* 圓角 */
    transition: width 0.5s ease; /* 平滑動畫 */
}

/* =========================================
   iPad Air (直向) & Tablet (寬度 <= 1024px)
   ========================================= */
@media (max-width: 1024px) {
  .progress-widget {
    width: 150px; /* 平板稍微縮小一點 */
  }
}

/* =========================================
   iPhone 12/14 Pro/Max (手機版 <= 768px)
   ========================================= */
@media (max-width: 768px) {
  .progress-widget {
    /* 這裡非常關鍵：寬度要夠小才能跟標題並排 */
    width: 110px; 
    margin: 0; 
    align-items: flex-end; /* 內容靠右對齊 */
    top: 4px;
  }

  .progress-text {
    font-size: 13px; /* 字體縮小 */
    margin-bottom: 4px;
    white-space: nowrap; /* 防止文字換行 */
  }

  .progress-track {
    height: 6px;  
  }
}
</style>