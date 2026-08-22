<template>
  <div class="dashboard-container" :class="{ expanded: activeRecord }">
    <!-- 左側列表（會從中間 → 左側移動） -->
    <div class="checkup-list-panel" :class="{ centered: !activeRecord }">
      <div
        v-for="(item, index) in checkupRecords"
        :key="index"
        :class="['checkup-item', { 'is-active': activeIndex === index }]"
        @click="selectRecord(index)"
      >
        <span class="indicator-icon">
          <template v-if="activeIndex === index">▼</template>
          <template v-else>▶</template>
        </span>
        <span class="item-text"
          >{{ item.date }} 第{{ item.checkupNumber }}次產檢</span
        >
      </div>
    </div>

    <!-- 右側內容（動畫淡入滑入） -->
    <transition name="slide-fade">
      <div v-if="activeRecord" class="report-area">
        <div class="report-card">
          <div class="report-header">
            <h3 class="report-title">
              {{ activeRecord.date }} 第{{ activeRecord.checkupNumber }}次產檢
            </h3>
            <button class="close-btn" @click="clearSelection">×</button>
          </div>

          <div class="report-table-container">
            <table>
              <thead>
                <tr>
                  <th v-for="header in tableHeaders" :key="header">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="key in filteredFields" :key="key">
                  <td>{{ fieldLabels[key] }}</td>
                  <td>{{ activeRecord.details[key] }}</td>
                  <td>{{ fieldDetails[key]?.unit || "--" }}</td>
                  <td>{{ fieldDetails[key]?.reference || "--" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../services/api.js";

const isMobile = ref(false);
// 一進入產檢資料專區就顯示最近一筆產檢報告

onMounted(async () => {
  checkupRecords.value = [];

  try {
    const res = await api.get("/api/prenatal");

    console.log("前端收到的原始 JSON:", res.data);

    checkupRecords.value = res.data.map((item, index, arr) => {
      const formattedDate = item.visit_date.split("T")[0];

      return {
        date: formattedDate,
        checkupNumber: arr.length - index,
        details: {
          gestational_age_wks: item.gestational_age_wks,
          gestational_age_days: item.gestational_age_days,
          gravida: item.gravida,
          para: item.para,
          SA: item.SA,
          AA: item.AA,
          LMP: item.LMP?.split("T")[0],
          PMP: item.PMP?.split("T")[0],
          married_status: item.married_status,
          body_weight: item.body_weight,
          blood_pressure_sys: item.blood_pressure_sys,
          blood_pressure_dia: item.blood_pressure_dia,
          body_height: item.body_height,
          BMI: item.bmi,
          pre_pregnancy_weight: item.pre_pregnancy_weight,
          pre_pregnancy_bmi: item.pre_pregnancy_bmi,
          urine_sugar: item.urine_sugar,
          urine_protein: item.urine_protein,
          Insemination: item.insemination,
          cohabitants_smoke: item.cohabitants_smoke,
          cohabitants_smoke_relationship:
            item.cohabitants_smoke_relationship,
        },
      };
    });

    if (checkupRecords.value.length > 0) {
      activeIndex.value = 0;
    }

  } catch (err) {
    console.error("抓取產檢資料失敗", err);
  }
});

/* -----------------------------
   欄位名稱中 → 中文對照表
----------------------------- */
const fieldLabels = {
  gestational_age_wks: "妊娠週數（週）",
  gestational_age_days: "妊娠天數（日）",
  gravida: "懷孕次數 G",
  para: "生產次數 P",
  SA: "自然流產 SA",
  AA: "人工流產 AA",
  LMP: "末次月經 LMP",
  PMP: "前次月經 PMP",
  married_status: "婚姻狀態",
  body_weight: "體重（kg）",
  blood_pressure_sys: "收縮壓（mmHg）",
  blood_pressure_dia: "舒張壓（mmHg）",
  body_height: "身高（cm）",
  BMI: "BMI",
  pre_pregnancy_weight: "孕前體重（kg）",
  pre_pregnancy_bmi: "孕前 BMI",
  urine_sugar: "尿糖",
  urine_protein: "尿蛋白",
  Insemination: "授精方式",
  cohabitants_smoke: "同住家人是否吸菸",
  cohabitants_smoke_relationship: "與同住吸菸者關係",
};

/* -----------------------------
   欄位單位與參考值對照表
----------------------------- */
const fieldDetails = {
  gestational_age_wks: { unit: "週", reference: "-" },
  gestational_age_days: { unit: "日", reference: "-" },
  gravida: { unit: "次", reference: "-" },
  para: { unit: "次", reference: "-" },
  SA: { unit: "次", reference: "-" },
  AA: { unit: "次", reference: "-" },
  LMP: { unit: "日期", reference: "-" },
  PMP: { unit: "日期", reference: "-" },
  married_status: { unit: "", reference: "1.Married\n2.Widowed\n3.Divorced\n4.Single\n5.Unknow" },
  body_weight: { unit: "kg", reference: "孕期體重建議增加10~14公斤\n(來源：衛生福利部)" },
  blood_pressure_sys: { unit: "mmHg", reference: "<140" },
  blood_pressure_dia: { unit: "mmHg", reference: "<90" },
  body_height: { unit: "cm", reference: "-" },
  BMI: { unit: "", reference: "18.5~24.9" },
  pre_pregnancy_weight: { unit: "kg", reference: "-" },
  pre_pregnancy_bmi: { unit: "", reference: "18.5~24.9" },
  urine_sugar: { unit: "", reference: "0~5\n（0.Neg, 1+, 2+, 3+, 4+, 5.Trace）" },
  urine_protein: { unit: "", reference: "0~5\n（0.Neg, 1+, 2+, 3+, 4+, 5.Trace）" },
  Insemination: { unit: "", reference: "試管嬰兒(IVF)/人工授精(AIH)" },
  cohabitants_smoke: { unit: "", reference: "Y/N" },
  cohabitants_smoke_relationship: { unit: "", reference: "" },
};


const filteredFields = computed(() => {
  if (!activeRecord.value) return [];
  return Object.keys(fieldLabels).filter(
    (key) => activeRecord.value.details[key] !== undefined
  );
});

// 產檢紀錄倒敘排序
const checkupRecords = ref([]);

const tableHeaders = ref(["檢驗項目名稱", "檢驗結果", "單位", "參考值"]);
const activeIndex = ref(null);

const activeRecord = computed(() => {
  if (activeIndex.value !== null) {
    return checkupRecords.value[activeIndex.value];
  }
  return null;
});

const selectRecord = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const clearSelection = () => {
  activeIndex.value = null;
};
</script>

<style scoped>
/* ------------------------------ */
/*  整體容器：展開與否影響 layout  */
/* ------------------------------ */
.dashboard-container {
  display: flex;
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 40px auto;
  transition: all 0.35s ease;
  min-height: 500px;
}

/* 當 activeRecord 不存在 → 左側面板在畫面中間 */
.checkup-list-panel.centered {
  margin: 0 auto;
}

/* 當 activeRecord 存在 → 左側靠左，右側出現 */
.dashboard-container.expanded {
  justify-content: flex-start;
}

/* ------------------------------ */
/*       左側列表面板樣式         */
/* ------------------------------ */
.checkup-list-panel {
  width: 260px;
  height: fit-content;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 15px 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.35s ease;
}

.checkup-item {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  cursor: pointer;
  transition: 0.2s;
  border-left: 4px solid transparent;
}

.checkup-item:hover {
  background-color: #f2f9ff;
}

.checkup-item.is-active {
  background-color: #e6f4ff;
  color: #1677ff;
  font-weight: bold;
  border-left: 4px solid #1677ff;
}

.indicator-icon {
  margin-right: 10px;
}

.item-text {
  text-decoration: underline;
}

/* ------------------------------ */
/*         右側動畫區域           */
/* ------------------------------ */
.report-area {
  flex: 1;
  padding-left: 25px;
}

/* 卡片樣式 */
.report-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 25px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

/* 標題列 */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.4em;
  cursor: pointer;
  color: #777;
}

/* ------------------------------ */
/*         右側動畫效果           */
/* ------------------------------ */
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-fade-enter-active {
  transition: all 0.4s ease;
}

.slide-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

/* 表格卡片內 */
.report-table-container {
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
}

table {
  width: 100%;
  text-align: center;
  border-collapse: collapse;
}

th {
  background: #f4f6f9;
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

td {
  padding: 10px;
  border: 1px solid #f2f2f2;
}

/* RWD */

@media (max-width: 768px) {
    /* -------------------------------------- */
    /* 📌 容器設定 (維持垂直堆疊) */
    /* -------------------------------------- */
    .dashboard-container {
        flex-direction: column;
        margin: 0 auto;
        padding: 0 0;
    }
    
    .dashboard-container.expanded {
        /* 在手機模式下，expanded 不再需要調整 justify-content */
        justify-content: initial; 
    }

    /* -------------------------------------- */
    /* 📌 列表面板 - 橫向滾動 & 頂部固定 (手機置頂) */
    /* -------------------------------------- */
    .checkup-list-panel {
        width: 100%;
        margin-bottom: 0;
        border-radius: 0;
        border: none;
        border-bottom: 1px solid #ddd;
        padding: 8px 0;
        overflow-x: auto;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        
        /* 🔥 確保列表固定在頂部 (sticky 效果很好，但不需要 z-index 這麼高) */
        position: sticky; 
        top: 0; 
        z-index: 10; /* 設一個中等 z-index */
        background: #fafafa;
    }
    
    .checkup-list-panel.centered {
        margin: 0;
    }

    .checkup-item {
        display: inline-block;
        white-space: normal;
        border-left: none;
        border-bottom: 3px solid transparent;
        padding: 8px 12px;
        margin: 0 4px;
    }

    .checkup-item.is-active {
        border-left: none;
        border-bottom: 3px solid #1677ff;
        background-color: transparent;
    }
    
    .indicator-icon {
        display: none;
    }

    .item-text {
        text-decoration: none;
        font-size: 14px;
    }
    
    /* -------------------------------------- */
    /* 右側報告 - 內嵌顯示 (不再覆蓋) */
    /* -------------------------------------- */
    .report-area {
        /* 🔥 移除所有固定定位和全屏樣式 */
        position: relative; /* 改為相對定位 */
        flex: none; /* 讓它根據內容佔用空間 */
        width: 100%; /* 佔滿下方寬度 */
        padding: 10px; /* 增加與左右兩側的空間 */
        z-index: 5; /* 低於列表面板 */
        
        /* 由於報告是內嵌在流式佈局中，不再需要 transform: translateX(100%) */
        /* 移除 padding-left: 25px; 讓它貼齊手機邊緣 */
    }

    .report-card {
        border-radius: 8px; /* 恢復圓角 */
        min-height: auto; /* 移除 min-height: 100vh */
        padding: 15px; /* 調整內邊距 */
    }
    
    .report-header {
        margin-bottom: 10px;
    }

    /* 隱藏關閉按鈕（因為不再是抽屜模式，點擊清單項目即可切換或關閉） */
    .close-btn {
        display: none; 
    }

    /* 表格可以左右滑 */
    .report-table-container {
        overflow-x: auto;
    }

    table {
        min-width: 500px;
        font-size: 14px;
    }
}

/* 平板：微調左右欄位比例 */
@media (min-width: 768px) and (max-width: 1180px) {
  /* 1. 關鍵：將容器改為垂直堆疊 */
  .dashboard-container {
      flex-direction: column;
      margin: 20px auto;
      padding: 0;
      max-width: 92%; /* 讓平板邊緣留一點空間 */
  }

  .dashboard-container.expanded {
      justify-content: initial; 
  }

  /* 2. 列表面板設定 */
  .checkup-list-panel {
      width: 100% !important; /* 強制覆蓋之前的 200px */
      margin-bottom: 0;
      border-radius: 0;
      border: none;
      border-bottom: 1px solid #ddd;
      padding: 8px 0;
      overflow-x: auto;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      position: sticky; 
      top: 0; 
      z-index: 10;
      background: #fafafa;
      display: block; /* 確保它是區塊顯示 */
  }

  .indicator-icon {
      display: none; /* 平板模式下不需要指示圖示 */
  }

  .checkup-list-panel.centered {
      margin: 0;
  }

  /* 讓項目在橫向排列時能正確顯示 */
  .checkup-item {
      display: inline-block;
      border-left: none;
      border-bottom: 3px solid transparent;
      padding: 12px 20px;
      margin: 0;
  }

  .item-text {
        text-decoration: none;
        font-size: 18px;
        font-weight: 500;
    }

  .checkup-item.is-active {
      border-left: none;
      border-bottom: 3px solid #1677ff;
      background-color: transparent;
  }

  /* 3. 右側內容區塊修正 */
  .report-area {
      position: relative;
      width: 100%;
      padding: 20px 0; /* 調整間距 */
      margin: 0;
      flex: none;
  }

  .report-card {
      width: 100%;
      box-sizing: border-box; /* 防止 padding 撐破寬度 */
  }

  .close-btn {
      display: none; /* 平板模式下不需要關閉按鈕 */
  }

}

/* 大螢幕：保持原本 layout */
@media (min-width: 1025px) {
  .dashboard-container {
    flex-direction: row;
  }
}
</style>