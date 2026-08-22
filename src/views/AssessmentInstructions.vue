<<<<<<< HEAD
=======

>>>>>>> d6b977e9c7c7633226c05ba9cbfab9dc9904dbde
<template>
  <AssessmentPanel title="問卷說明">
    <div class="info-card">
      <h3>孕婦產前健康照護衛教指導紀錄表</h3>
      <p class="card-content">
        (此紀錄表用來協助孕婦了解產前各階段的健康照護重點)
        <br><br>
        內容包含基本資料、健康行為（如菸酒、憂鬱檢測）及孕產醫療史調查，以判斷是否需轉診治療，同時檢核對早產徵兆、營養攝取、生產計畫及母乳哺育等衛教重點的了解程度，請準媽媽們依照週數進程，定期檢視並記錄自身的健康狀況，若有異常請立即尋求醫療協助，透過完整的紀錄，能協助醫護人員更精確掌握您的孕期狀況。
      </p>
    </div>

    <div class="info-card">
      <h3>愛丁堡產後憂鬱量表</h3>
      <p class="card-content">
        (此量表是用來協助產後婦女評估自身情緒狀態的篩檢工具)
        <br><br>
        產後情緒變化是常見的現象，透過此量表可早期發現產後憂鬱的徵兆，請您依據過去七天內的感受進行填寫，此量表僅供篩檢參考，並非正式診斷，若您的總分偏高或有傷害自己的念頭，請務必尋求專業醫師或心理師的諮詢與協助， 如總分 10-12 分，顯示需注意及追蹤並近期內再次評估或找專科醫師處理, 如超過 13 分，顯示應找專科醫師處理。
      </p>
    </div>
  </AssessmentPanel>
</template>

<script setup>
import AssessmentPanel from '../components/AssessmentPanel.vue';
</script>

<style scoped>
/* 白色卡片樣式 */
.info-card {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* 輕微陰影 */
  border: 1px solid #f1f5f9;
}

.info-card h3 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
  margin-bottom: 15px;
  border-left: 4px solid #57aee2;
  padding-left: 12px;
  line-height: 1.4;
}

.card-content {
  color: #5a6b7c; /* 深灰藍色文字 */
  line-height: 1.8;
  font-size: 15px;
  text-align: justify; /* 文字左右對齊 */
}

/* --- RWD 調整 --- */
@media (max-width: 768px) {
  .info-card {
    padding: 20px; /* 手機版內距縮小 */
    margin-bottom: 15px;
  }

  .info-card h3 {
    font-size: 18px;
    margin-bottom: 12px;
    padding-left: 10px;
    border-left-width: 3px;
  }

  .card-content {
    font-size: 15px; /* 手機上 15px 是很舒服的大小 */
    line-height: 1.6;
    text-align: left; /* 手機版有時候靠左對齊比左右對齊好看(避免文字間距過大) */
  }
}
</style>
