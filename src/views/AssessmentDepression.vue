<template>
  <AssessmentPanel ref="panelRef" title="愛丁堡產後憂鬱量表" subtitle="（請您依據過去七天內的感受進行填寫）">
    <AssessmentProgressBar :completionRate="completionRate" />
    <div class="info-section">
      <div class="input-row">
        <label class="field-label">身分：</label>
        <div class="radio-group-inline">
          <label class="radio-pill">
            <input type="radio" v-model="form.identity" value="1"> 準媽媽
          </label>
          <label class="radio-pill">
            <input type="radio" v-model="form.identity" value="2"> 寶寶媽媽
          </label>
        </div>
      </div>

      <div class="input-row">
        <label class="field-label">預產期或寶寶生日：</label>
        <input type="date" v-model="form.date" class="date-input">
      </div>
    </div>

    <hr class="divider">

    <div v-show="currentStep === 1" class="question-list">
      <div v-for="q in questions.slice(0, 4)" :key="q.id" class="question-card">
        <p class="q-text">
          <span class="q-num">{{ q.id }}.</span> {{ q.text }}
        </p>
        
        <div class="options-container">
          <label 
            v-for="(opt, optIndex) in q.options" 
            :key="optIndex" 
            class="option-item"
            :class="{ 'selected': q.selectedVal === opt.value }"
          >
            <input 
              type="radio" 
              :name="`question-${q.id}`" 
              :value="opt.value" 
              v-model="q.selectedVal"
            >
            <span class="opt-text">{{ opt.text }}</span>
          </label>
        </div>
      </div>
    </div>
    <div v-show="currentStep === 2">
       <div class="question-list">
         <div v-for="q in questions.slice(4)" :key="q.id" class="question-card">
           <p class="q-text">
             <span class="q-num">{{ q.id }}.</span> {{ q.text }}
           </p>
           
           <div class="options-container">
             <label 
               v-for="(opt, optIndex) in q.options" 
               :key="optIndex" 
               class="option-item"
               :class="{ 'selected': q.selectedVal === opt.value }"
             >
               <input 
                 type="radio" 
                 :name="`question-${q.id}`" 
                 :value="opt.value" 
                 v-model="q.selectedVal"
               >
               <span class="opt-text">{{ opt.text }}</span>
             </label>
           </div>
         </div>
       </div>
    </div>

    <div class="navigation-buttons">
      <button 
        v-if="currentStep > 1" 
        class="nav-btn btn-prev" 
        @click="prevStep"
      >
        上一頁
      </button>
      
      <button 
        v-if="currentStep < totalSteps" 
        class="nav-btn btn-next" 
        @click="nextStep"
      >
        下一頁
      </button>
      
      <button 
        v-if="currentStep === totalSteps" 
        class="nav-btn btn-submit" 
        @click="submitForm"
      >
        送出表單
      </button>
    </div>
    <div v-if="showResultModal" class="modal-overlay">
      <div class="modal-box">
        <button class="modal-close" @click="closeModal">×</button>
        
        <div class="modal-content">
          <h3 class="result-title">評估總分</h3>
          <div class="score-circle" :class="scoreStatusClass">
            {{ totalScore }}
          </div>

          <div class="result-message-box" :class="messageBoxBgClass">
            <p class="message-text">{{ resultMessage }}</p>
          </div>
          
          <div v-if="previousScore !== null" class="trend-section">
            <div class="trend-summary">
              <div class="trend-text">
                與上次測驗相比，您的分數 <span :class="trendClass">{{ trendText }}</span>
              </div>
              <div class="prev-score-hint">
                （上次分數：{{ previousScore }} 分）
              </div>
            </div>

            <p class="trend-encouragement" :style="{ borderLeftColor: themeHexColor, backgroundColor: themeLightBgColor }">
              {{ trendEncouragement }}
            </p>
            
            <div class="svg-chart-container">
              <svg viewBox="0 0 400 200" class="trend-svg" preserveAspectRatio="xMidYMid meet">
                
                <g class="grid-lines">
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#e2e8f0" stroke-dasharray="4" />
                  <text x="30" y="24" font-size="12" fill="#a0aec0" text-anchor="end">30</text>
                  
                  <line x1="40" y1="80" x2="380" y2="80" stroke="#e2e8f0" stroke-dasharray="4" />
                  <text x="30" y="84" font-size="12" fill="#a0aec0" text-anchor="end">20</text>
                  
                  <line x1="40" y1="140" x2="380" y2="140" stroke="#e2e8f0" stroke-dasharray="4" />
                  <text x="30" y="144" font-size="12" fill="#a0aec0" text-anchor="end">10</text>
                  
                  <line x1="40" y1="180" x2="380" y2="180" stroke="#cbd5e0" />
                  <text x="30" y="184" font-size="12" fill="#a0aec0" text-anchor="end">0</text>
                </g>

                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="themeHexColor" stop-opacity="0.3" />
                    <stop offset="100%" :stop-color="themeHexColor" stop-opacity="0.0" />
                  </linearGradient>
                </defs>

                <path v-if="areaPath" :d="areaPath" fill="url(#areaGradient)" />

                <path v-if="linePath" :d="linePath" fill="none" :stroke="themeHexColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

                <g v-for="(point, index) in chartPoints" :key="index">
                  <circle :cx="point.x" :cy="point.y" r="5" :fill="themeHexColor" stroke="#ffffff" stroke-width="2" />
                  <text :x="point.x" :y="point.y - 12" font-size="14" font-weight="bold" fill="#2d3748" text-anchor="middle">
                    {{ point.score }}
                  </text>
                  <text :x="point.x" :y="195" font-size="12" fill="#718096" text-anchor="middle">
                    {{ point.label }}
                  </text>
                </g>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AssessmentPanel>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AssessmentPanel from '../components/AssessmentPanel.vue';
import AssessmentProgressBar from '../components/AssessmentProgressBar.vue';
import api from '../services/api.js';
// 引入 JSON 資料檔
import depressionQuestions from '../assets/data/depressionQuestions.json';

const router = useRouter();
// 取得當前登入者 ID 的輔助函式
const getCurrentUserId = () => {
  const userStr = sessionStorage.getItem("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.user_id;
  } catch (error) {
    console.error("解析登入資料失敗", error);
    return null;
  }
};

// 使用 JSON 資料初始化 questions
// 使用深拷貝確保每次進入頁面都是乾淨的狀態，不會被快取影響
const questions = reactive(JSON.parse(JSON.stringify(depressionQuestions)));

// 表單基本資料
const form = reactive({
  identity: null, // 1:準媽媽, 2:寶寶媽媽
  date: ''        // 預產期 YYYY-MM-DD
});

// 定義分頁狀態 
const currentStep = ref(1);
const totalSteps = 2; // 共 2 頁
const panelRef = ref(null);
// 下一頁函式
const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++;
    panelRef.value?.scrollToTop(); // 換頁後滾回頂部
  }
};

// 上一頁函式 
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    panelRef.value?.scrollToTop();
  }
};

// 分頁驗證邏輯 
const validateCurrentStep = () => {
  if (currentStep.value === 1) {
    // 檢查基本資料
    if (!form.identity) {
      alert('請填寫身分');
      return false;
    }
    if (!form.date) {
      alert('請填寫預產期或寶寶生日');
      return false;
    }

    // 檢查第 1~4 題 (對應陣列索引 0~3)
    // 使用 slice(0, 4) 取出前四題檢查
    const part1Questions = questions.slice(0, 4);
    const allAnswered = part1Questions.every(q => q.selectedVal !== null);

    if (!allAnswered) {
      alert('請完成本頁所有題目 (第 1 到第 4 題)');
      return false;
    }
  }
  // 第二頁的檢查在 submitForm 統一處理
  return true;
};

// --- 判定身分的邏輯函式 ---
const updateMaternalStatus = (dateStr) => {
  if (!dateStr) return;
  const today = new Date().setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr).setHours(0, 0, 0, 0);
  
  // 自動判定：未來或今天 = 準媽媽(1)，過去 = 寶寶媽媽(2)
  form.identity = targetDate >= today ? '1' : '2';
};

// --- 監聽日期變動 (當使用者手動修改日期時，身分也會跟著變) ---
watch(() => form.date, (newVal) => {
  updateMaternalStatus(newVal);
});

// --- 頁面載入時從後端 API 自動代入 ---
onMounted(async () => {
  try {
    // 動態獲取 userId 來代入預產期
    const userId = getCurrentUserId();
    const response = await api.get(`http://192.168.100.6:3000/api/personal_information/${userId}`);
    const result = response.data; // 直接從 .data 拿

    if (result.success && result.data.dueDate) {
      // 1. 取得預產期並處理格式 (HTML5 <input type="date"> 需使用 - 分隔)
      const formattedDate = result.data.dueDate.replace(/\//g, '-');
      
      // 2. 填入表單
      form.date = formattedDate;

      // 3. 執行第一次身分判定
      updateMaternalStatus(formattedDate);
      
      console.log("愛丁堡表單預產期代入成功，身分已自動判定");
    }
  } catch (error) {
    console.error("從後端抓取資料失敗:", error);
    // 備案：API 失敗時可維持手動填寫或讀取 localStorage
  }
});

// 控制結果彈窗
const showResultModal = ref(false);

// 計算填寫進度百分比 (包含身分、日期與 10 題問卷)
const completionRate = computed(() => {
  let filledCount = 0;
  
  // 1. 檢查身分
  if (form.identity) filledCount++;
  
  // 2. 檢查日期
  if (form.date) filledCount++;
  
  // 3. 檢查 10 題問卷
  const answeredQuestions = questions.filter(q => q.selectedVal !== null).length;
  filledCount += answeredQuestions;

  // 總項目 = 2 (基本資料) + 題目數量
  const totalItems = 2 + questions.length; 
  
  return Math.round((filledCount / totalItems) * 100);
});

// 計算總分
const totalScore = computed(() => {
  return questions.reduce((sum, q) => sum + (q.selectedVal || 0), 0);
});

// 判斷結果訊息
const resultMessage = computed(() => {
  const score = totalScore.value;
  if (score >= 13) {
    return '您的身心健康狀況可能需要醫療專業的協助，請找專業醫師協助處理。';
  } else if (score >= 10) {
    return '請注意~您目前狀況可能有情緒困擾，讓您與身旁的人多聊聊，給心情一個出口，必要時可尋求專業人員協助。';
  } else {
    return '您的身心狀況不錯，請繼續維持。';
  }
});

// 判斷結果顏色 Class
const scoreStatusClass = computed(() => {
  const score = totalScore.value;
  if (score >= 13) return 'status-danger';
  if (score >= 10) return 'status-warning';
  return 'status-normal';
});

// 計算結果建議區塊的背景顏色 Class
const messageBoxBgClass = computed(() => {
  const score = totalScore.value;
  if (score >= 13) return 'bg-danger-light';
  if (score >= 10) return 'bg-warning-light';
  return 'bg-normal-light';
});

// 計算動態主題色（讓圖表與鼓勵語邊框和總分顏色一致）
const themeHexColor = computed(() => {
  const score = totalScore.value;
  if (score >= 13) return '#da291c'; 
  if (score >= 10) return '#f39c12'; 
  return '#27ae60'; 
});

// 計算鼓勵語區塊的動態淡底色
const themeLightBgColor = computed(() => {
  const score = totalScore.value;
  if (score >= 13) return '#fcf7f7'; // 淡紅色
  if (score >= 10) return '#faf7f3'; // 淡橘色
  return '#f3f6f3';                  // 淡綠色
});

// 歷史紀錄與圖表狀態
const pastHistoryData = ref([]);
const previousScore = ref(null);

// 計算趨勢文字
const trendText = computed(() => {
  if (previousScore.value === null) return '';
  const diff = totalScore.value - previousScore.value;
  if (diff > 0) return `上升了 ${diff} 分 ▲`;
  if (diff < 0) return `下降了 ${Math.abs(diff)} 分 ▼`;
  return '沒有變動 ＝';
});

// 計算趨勢顏色
const trendClass = computed(() => {
  if (previousScore.value === null) return '';
  const diff = totalScore.value - previousScore.value;
  if (diff > 0) return 'trend-up-danger'; 
  if (diff < 0) return 'trend-down-good'; 
  return 'trend-flat';
});

// 計算趨勢專屬鼓勵語
const trendEncouragement = computed(() => {
  if (previousScore.value === null) return '';
  
  const diff = totalScore.value - previousScore.value;
  
  if (diff < 0) {
    // 分數下降：情況好轉
    return '太棒了！看起來您最近的心情與狀態有所好轉，這陣子辛苦了，請繼續保持愉悅的心情哦～';
  } else if (diff > 0) {
    // 分數上升：情況變差
    return '最近是不是感覺比較累呢？分數稍微上升了一些，但請別氣餒，情緒有起伏是非常正常的，照顧寶寶很耗費心力，請記得給自己多一點喘息的時間，需要時一定要向身邊的人尋求協助。';
  } else {
    // 分數持平
    return '您的分數和上次相同，每天面對懷孕或育兒的各種挑戰，維持現狀十分不容易，您已經做得很好了！';
  }
});

// 整合歷史紀錄與本次分數
const chartData = computed(() => {
  // 將所有歷史紀錄轉換格式，並保留原本的「第 X 次」真實序號
  const data = pastHistoryData.value.map((item, index) => ({
    label: `第 ${index + 1} 次`,
    score: item.score
  }));
  // 加入本次的分數
  data.push({
    label: '本次',
    score: totalScore.value
  });

  // 避免圖表太擠，最多只顯示「最近 7 次」的趨勢
  const MAX_DISPLAY = 7; 
  if (data.length > MAX_DISPLAY) {
    // 如果總次數超過 7 次，就只切出陣列的最後 7 筆來畫圖
    return data.slice(-MAX_DISPLAY); 
  }
  return data;
});

// 計算每個資料點在 SVG 中的 X, Y 座標
const chartPoints = computed(() => {
  const data = chartData.value;
  if (data.length === 0) return [];
  
  const width = 340; 
  const height = 160; 
  const padLeft = 40;
  const padTop = 20;
  const maxScaleScore = 30; 

  return data.map((item, index) => {
    const x = data.length === 1 
      ? padLeft + width / 2 
      : padLeft + (index / (data.length - 1)) * width;
    const y = padTop + height - (item.score / maxScaleScore) * height;
    return { ...item, x, y };
  });
});

// 計算折線的 SVG 路徑
const linePath = computed(() => {
  const points = chartPoints.value;
  if (points.length === 0) return '';
  return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
});

// 計算下方漸層區域的 SVG 路徑
const areaPath = computed(() => {
  const points = chartPoints.value;
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  const baseY = 180; 
  return `${linePath.value} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
});

const submitForm = async () => {
  if (!form.identity || !form.date) {
    alert('請填寫完整資訊');
    return;
  }
  if (completionRate.value < 100) {
    alert('請完成所有題目');
    return;
  }

  try {
    // 動態獲取 userId 來送出表單
    const userId = getCurrentUserId();
    
    const response = await api.post("http://192.168.100.6:3000/api/submit_edinburgh", {
      user_id: userId,
      form: form,
      questions: questions,
      totalScore: totalScore.value,
      message: resultMessage.value
    });

    const result = response.data;
    
    if (result.success) {
      // 成功後顯示彈窗
      showResultModal.value = true;
      // 呼叫後端 API 獲取歷史分數
      try {
        // 呼叫在後端建立的新 API
        const historyRes = await api.get(`http://192.168.100.6:3000/api/edinburgh_history/${userId}`);
        const historyResult = historyRes.data;

        if (historyResult.success && historyResult.data && historyResult.data.length > 0) {
          const allRecords = historyResult.data;
          
          //「本次」測驗已經寫入資料庫， allRecords 的最後一筆就是「本次」的分數。
          // 把最後一筆切掉 (slice(0, -1))，剩下的才算是「過去的紀錄」。
          if (allRecords.length > 1) {
            const pastRecords = allRecords.slice(0, -1); 
            pastHistoryData.value = pastRecords;
            
            // 取出過去紀錄中的最後一筆，作為「上次測驗分數」
            previousScore.value = pastRecords[pastRecords.length - 1].score;
          } else {
            // 如果長度只有 1，代表這是使用者的「第一次測驗」，還沒有過去的紀錄
            pastHistoryData.value = [];
            previousScore.value = null;
          }
        }
      } catch (err) {
        console.error("取得歷史分數失敗:", err);
      }
    } else {
      alert("儲存失敗：" + result.message);
    }
  } catch (error) {
    console.error("連線錯誤：", error);
    alert("無法連線至伺服器");
  }
};


// 關閉函式
const closeModal = () => {
  showResultModal.value = false;
  // 跳轉至歷史填寫紀錄頁面
  router.push('/self-assessment/history');
};
</script>

<style scoped>
/* 按鈕樣式 */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px 0;
}

.nav-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-prev {
  background-color: #e2e8f0;
  color: #4a5568;
}

.btn-next {
  background-color: #3498db;
  color: white;
}

.btn-submit {
  background-color: #3498db;
  color: white;
}
/* --- 上方基本資訊區 --- */
.info-section {
  padding: 10px 20px;
  background-color: transparent;
}

.input-row {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.field-label {
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
  width: 150px; /* 固定寬度讓標題對齊 */
  flex-shrink: 0;
}

.radio-group-inline {
  display: flex;
  gap: 15px;
}

.radio-pill {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #555;
}

.radio-pill input {
  margin-right: 5px;
}

.date-input {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #555;
}

.divider {
  border: 0;
  border-top: 1px solid #cbd5e0;
  margin: 10px 0 20px 0;
}

/* --- 題目列表區 --- */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  background-color: white; /* 讓每題有白色背景，增加層次 */
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.q-text {
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 15px;
}

.q-num {
  margin-right: 5px;
}

.options-container {
  display: flex;
  flex-wrap: wrap; /* 手機版自動換行 */
  gap: 15px;
}

.option-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 0;
  margin-right: 15px;
}

.option-item input {
  margin-right: 6px;
  /* 圓圈選取顏色 */
  /* accent-color: #5a6b7c; */
}

.opt-text {
  color: #555;
  font-size: 15px;
}

/* --- 結果彈窗樣式 --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-box {
  background-color: white;
  width: 440px;
  padding: 40px 30px;
  border-radius: 8px;
  position: relative;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.modal-close {
  position: absolute;
  top: 10px; right: 10px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.score-circle {
  width: 80px; height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin: 0 auto 15px auto;
}

.status-danger { background-color: #da291c; }   
.status-warning { background-color: #f39c12; }  
.status-normal { background-color: #27ae60; }

.result-title {
  margin: 0 0 15px 0;
  color: #333;
}

.result-message-box {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  text-align: center;
  font-weight: bold;
}

/* 根據分數給予不同底色 */
.bg-normal-light { background-color: #e6f6e9; color: #27ae60; }
.bg-warning-light { background-color: #fdf3e8; color: #d35400; }
.bg-danger-light { background-color: #fdedec; color: #c0392b; }

.message-text {
  line-height: 1.6;
  margin: 0;
}

/* ==========================================
   趨勢圖表區塊樣式
   ========================================== */
.trend-section {
  padding-top: 25px;
  border-top: 2px dashed #e2e8f0; /* 明確的視覺分隔線 */
}

/* 趨勢文字置中排版 */
.trend-summary {
  text-align: center;
  margin-bottom: 18px;
}

.trend-text {
  font-size: 16px;
  font-weight: bold;
  color: #4a5568;
  margin-bottom: 6px;
}

.prev-score-hint {
  font-size: 14px;
  color: #a0aec0;
}

.trend-up-danger { color: #e53e3e; }
.trend-down-good { color: #38a169; }
.trend-flat { color: #718096; }

.svg-chart-container {
  width: 100%;
  height: auto;
  margin-top: 15px;
}

.trend-svg {
  width: 100%;
  height: 200px;
  display: block;
}

/* 鼓勵語樣式微調 */
.trend-encouragement {
  font-size: 14px;
  color: #4a5568;
  /* background-color: #f8f9fa;  */
  /* background-color: #f4f3ed; */
  padding: 12px 15px;
  border-radius: 6px;
  margin: 0 0 20px 0;
  line-height: 1.6;
  text-align: left;
  border-left: 4px solid; 
}

/* =========================================
   2. iPad Air & Tablet (寬度 769px ~ 1024px)
   ========================================= */
@media (max-width: 1024px) {
  .info-section {
    padding: 0 10px;
  }
  
  /* 選項改為 Grid 雙欄排列，比較整齊 */
  .options-container {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 左右各一個 */
    gap: 12px;
  }
  
  .option-item {
    justify-content: flex-start;
    background-color: #f9fbfd; /* 給一個淡底色區分 */
    padding: 10px;
  }
}

/* =========================================
   3. iPhone 12/14 Pro/Max & Mobile (寬度 <= 768px)
   ========================================= */
@media (max-width: 768px) {
  .navigation-buttons {
    flex-direction: column-reverse;
    gap: 15px;
  }
  .nav-btn {
    width: 100%;
  }
  /* 輸入列改為垂直堆疊 */
  .input-row {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 25px;
  }

  .field-label {
    width: 100%;
    margin-bottom: 10px;
    font-size: 16px;
  }

  /* 身分選擇按鈕排版：改為滿版按鈕 */
  .radio-group-inline {
    width: 100%;
    gap: 12px;
  }
  
  .radio-pill {
    flex: 1; /* 兩個按鈕平分寬度 */
    justify-content: center; /* 文字置中 */
    padding: 12px;
    border-radius: 8px;
    border: 1px solid transparent;
  }
  
  /* 選中時增加邊框提示 */
  .radio-pill:has(input:checked) {
    background-color: #ebf8ff;
    border-color: #bee3f8;
    color: #2b6cb0;
  }

  /* 日期輸入框滿版 */
  .date-input {
    width: 100%;
    font-size: 16px; /* 防止 iOS Safari 自動放大 */
    padding: 12px;
    box-sizing: border-box; /* 確保 padding 不撐開 */
  }

  /* 題目卡片優化 */
  .question-card {
    padding: 20px 15px; /* 左右內距縮小 */
  }

  /* 選項改為單欄垂直堆疊 (手指好點) */
  .options-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .option-item {
    width: 100%;
    padding: 12px 15px; /* 增加觸控高度 */
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-sizing: border-box;
  }
  
  /* 選中時的效果 */
  .option-item.selected {
    background-color: #ebf8ff;
    border-color: #3498db;
  }

  /* 選項文字大小 */
  .opt-text {
    font-size: 16px;
    line-height: 1.4;
  }

  /* Radio 按鈕加大 */
  .option-item input, .radio-pill input {
    width: 22px;
    height: 22px;
    margin-right: 12px;
  }

  /* 彈窗調整 */
  .modal-box {
    width: 85%; /* 改為百分比寬度 */
    padding: 30px 20px;
  }
  /*圖表高度微調*/
  .trend-svg {
    height: 160px;
  }
}
</style>