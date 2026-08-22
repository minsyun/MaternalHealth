<template>
  <AssessmentPanel title="歷史填寫詳細內容">
    
    <div v-if="!record" class="error-msg">找不到該筆資料或讀取錯誤</div>

    <div v-else class="detail-container">
      
      <div class="meta-header">
        <div class="header-content">
          <h2 class="record-title">{{ record.title }}</h2>
          <span class="record-date">填寫時間：{{ formatTime(record.submitTime) }}</span>
        </div>
      </div>

      <div v-if="record.type === 'depression'" class="depression-detail">
        
        <div class="result-summary">
          <div class="score-box" :class="getScoreClass(record.totalScore)">
            <span class="score-val">{{ record.totalScore }}</span>
            <span class="score-label">總分</span>
          </div>
          <div class="feedback-box">
            <h4>評估結果建議：</h4>
            <p>{{ record.message }}</p>
          </div>
        </div>

        <div class="form-card">
          <div class="card-label">基本資料</div>
          <div class="card-body">
            <p><strong>身分：</strong> {{ record.form.identityText }}</p>
            <p><strong>預產期/寶寶生日：</strong> {{ record.form.date || '未填寫'}}</p>
          </div>
        </div>

        <div class="form-card">
          <div class="card-label">答題明細</div>
          <div class="card-body">
            <div v-for="q in record.questions" :key="q.id" class="qa-item">
              <p class="qa-question">{{ q.id }}. {{ q.text }}</p>
              <div class="qa-answer">
                <span class="ans-label">您的回答：</span>
                <span class="ans-text">{{ q.answerText }}</span>
                <span class="ans-score">({{ q.selectedVal }}分)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="record.type === 'prenatal' || !record.type" class="prenatal-detail">
        
        <div class="form-card">
          <div class="card-label">基本資料</div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item"><label>姓名：</label> {{ record.formData.name }}</div>
              <div class="info-item"><label>身分證：</label> {{ record.formData.idNumber }}</div>
              <div class="info-item"><label>出生日期：</label> {{ record.formData.birthDate }}</div>
              <div class="info-item"><label>地址：</label> {{ record.formData.address }}</div>
              <div class="info-item"><label>手機號碼：</label> {{ record.formData.phone }}</div>
              <div class="info-item"><label>住家電話：</label> {{ record.formData.homePhone }}</div>
            </div>
          </div>
        </div>

        <div class="form-card" v-if="record.formData.behavior">
          <div class="card-label">健康行為</div>
          <div class="card-body">
            <ul class="readonly-list">
              <li><label>吸菸習慣：</label> {{ optionMaps.smoking[record.formData.behavior.smoking] }}</li>
              <li><label>二手菸環境：</label> {{ optionMaps.secondhandSmoke[record.formData.behavior.secondhandSmoke] }}</li>
              <li><label>飲酒習慣：</label> {{ optionMaps.drinking[record.formData.behavior.drinking] }}</li>
              <li><label>嚼檳榔：</label> {{ optionMaps.betelNut[record.formData.behavior.betelNut] }}</li>
              <li><label>使用毒品：</label> {{ optionMaps.drugs[record.formData.behavior.drugs] }}</li>
              <li>
                <label>憂鬱檢測：</label>
                <div class="sub-list">
                  <p>1. 情緒低落：{{ optionMaps.depression[record.formData.behavior.depression1] }}</p>
                  <p>2. 失去興趣：{{ optionMaps.depression[record.formData.behavior.depression2] }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="form-card" v-if="record.formData.medicalHistory">
          <div class="card-label">醫療病史</div>
          <div class="card-body">
            <div class="history-result">
              <p class="history-main">是否有病史：
                <span :class="record.formData.medicalHistory.hasHistory ? 'text-alert' : 'text-safe'">
                  {{ record.formData.medicalHistory.hasHistory ? '是' : '否' }}
                </span>
              </p>
              
              <div v-if="record.formData.medicalHistory.hasHistory" class="selected-tags">
                <span v-for="item in record.formData.medicalHistory.selectedItems" :key="item" class="tag">
                  {{ medicalLabels[item] || '其他' }}
                  <span v-if="item === '11'"> ({{ record.formData.medicalHistory.otherNote }})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-card">
          <div class="card-label">衛教指導</div>
          <div class="card-body">
            <div v-for="(topic, index) in record.eduData" :key="index" class="edu-readonly-group">
              <p class="edu-sub-title">{{ topic.title }}</p>
              
              <div class="edu-list">
                <div v-for="(point, pIndex) in topic.points" :key="pIndex" class="edu-detail-row">
                  
                  <div class="edu-question-text">
                    {{ point.text }}
                  </div>
                  
                  <div class="edu-status-tag">
                    <span class="status-badge" :class="point.value === 1 ? 'bg-blue' : 'bg-red'">
                      {{ optionMaps.education[point.value] }}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="footer-action">
        <button class="back-btn" @click="router.back()">返回</button>
      </div>

    </div>
  </AssessmentPanel>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AssessmentPanel from '../components/AssessmentPanel.vue';
import api from '../services/api.js';
// 引入 JSON 檔案
import prenatalQuestions from '../assets/data/prenatalQuestions.json'; 
import depressionQuestions from '../assets/data/depressionQuestions.json';

const route = useRoute();
const router = useRouter();
const record = ref(null);
const isLoading = ref(true);

// --- 選項對照表 ---
const optionMaps = {
  smoking: { 0: '否', 1: '偶爾或應酬才吸', 2: '平均一天約吸一包菸以下', 3: '平均一天約吸一包菸以上' },
  secondhandSmoke: { 0: '否', 1: '是', 2: '周遭環境沒有二手菸' },
  drinking: { 0: '否', 1: '偶爾或應酬才喝', 2: '經常喝' },
  betelNut: { 0: '否', 1: '偶爾或應酬才嚼', 2: '經常嚼' },
  drugs: { 0: '否', 1: '是' },
  depression: { 0: '否', 1: '是' },
  education: { 1: '清楚', 0: '不清楚'}
};

// --- 醫療病史標籤 ---
const medicalLabels = {
  '1': '妊娠期高血壓疾病', '2': '前置胎盤', '3': '羊水過多或過少',
  '4': '胎兒生長限制', '5': '胎盤功能異常', '6': '胎兒體重過重',
  '7': '遺傳疾病', '8': '嚴重合併症', '9': '骨盆異常', '10': '子宮、產道異常',
  '11': '其他', '8-1': '心臟病', '8-2': '腎臟疾病',
  '8-3': '血液系統疾病', '8-4': '肝臟疾病', '8-5': '活動性肺結核',
  '8-6': '糖尿病', '8-7': '甲狀腺功能亢進症', '8-8': '精神病或神經系統疾病',
  '8-9': '妊娠合併免疫系統疾病', '8-10': '卵巢或子宮腫瘤',
  '8-11': '孕期感染性疾病', '8-12': '性傳染病'
};

// 衛教指導的映射邏輯：用 JSON 中的 educationTopics
const mapPrenatalEducation = (backendAnswers) => {
  let globalIndex = 1; // 對應後端 question_index (1-18)
  
  return prenatalQuestions.educationTopics.map(topic => {
    return {
      title: topic.title,
      points: topic.points.map(p => {
        // 從後端回傳資料中找尋對應索引的數值
        const answer = backendAnswers.find(a => parseInt(a.index) === globalIndex);
        globalIndex++;
        return {
          text: p.text,
          value: answer ? answer.value : 0
        };
      })
    };
  });
};

// --- 獲取詳細資料的函式 ---
const fetchDetail = async () => {
  const responseId = route.params.id;
  const formType = route.query.type; // 從網址取得 ?type=...
  try {
    isLoading.value = true;
    
    // 直接根據 type 決定 API 路徑與判斷布林值
    const isPrenatal = formType === 'prenatal';
    const apiUrl = isPrenatal 
      ? `http://192.168.100.6:3000/api/prenatal_detail/${responseId}`
      : `http://192.168.100.6:3000/api/edinburgh_detail/${responseId}`;
    
    const response = await api.get(apiUrl)  
    // axios 會自動解析 JSON 並放在 .data 屬性中
    const data = response.data;

    if (isPrenatal) {
      // --- 映射產前表單資料 ---
      record.value = {
        submitTime: data.summary.submit_time,
        title: "孕婦產前健康照護衛教指導紀錄表",
        type: 'prenatal',
        formData: {
          name: data.summary.name,
          idNumber: data.summary.idNumber,
          birthDate: data.summary.birthDate,
          address: data.summary.address,
          phone: data.summary.phone,
          homePhone: data.summary.homePhone,
          behavior: data.behavior, // 包含 smoking, drinking 等
          medicalHistory: data.medicalHistory // 包含 hasHistory, selectedItems
        },
        // 將 18 題扁平資料轉為分組格式
        eduData: mapPrenatalEducation(data.education)
      };
    } else {
      // --- 映射愛丁堡量表資料 ---
      record.value = {
        submitTime: data.summary.submit_time,
        title: "愛丁堡產後憂鬱量表",
        type: 'depression',
        totalScore: data.summary.total_score,
        message: data.summary.advice,
        form: {
          identityText: data.summary.role,
          date: data.summary.edc
        },
        questions: data.answers.map(ans => {
          const questionInfo = depressionQuestions.find(q => q.id == ans.question_num);
          return {
            id: ans.question_num,
            text: questionInfo ? questionInfo.text : "未知題目",
            selectedVal: ans.score,
            answerText: ans.answer_text
          };
        })
      };
    }
  } catch (error) {
    console.error("讀取詳細資料失敗:", error);
    record.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});

// --- 其他輔助函式 ---
const getScoreClass = (score) => {
  if (score >= 13) return 'status-danger';
  if (score >= 10) return 'status-warning';
  return 'status-normal';
};

// 時間格式化函式
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  // 將 timestamp (毫秒) 轉為 Date 物件
  const date = new Date(timestamp);
  
  // 轉為中文格式 
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // hour12: false // 使用 24 小時制
  });
};

</script>

<style scoped>
/* =========================================
   核心結構樣式 (Form Card) - 兩個量表共用
   ========================================= */
.meta-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
.record-title { margin: 0; color: #2c3e50; font-size: 20px; }
.record-date { color: #7f8c8d; font-size: 14px; }
.footer-action {
  text-align: right;
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #cbd5e0;
}

.back-btn {
  background-color: #5a6b7c;
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #3498db;
}


/* 統一的卡片樣式 */
.form-card { 
  background: #fff; 
  margin-bottom: 20px; 
  border-radius: 6px; 
  display: flex; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.05); 
  overflow: hidden; 
  border: 1px solid #eef2f7;
}

/* 左側標題 (垂直) */
.card-label { 
  background: #f0f4f8; 
  width: 45px; 
  writing-mode: vertical-lr; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: bold; 
  color: #5a6b7c; 
  letter-spacing: 2px;
  flex-shrink: 0; /* 防止被壓縮 */
  padding: 10px 0; /* 上下留白避免文字貼邊 */
}

/* 右側內容區 */
.card-body { flex: 1; padding: 20px; }


/* =========================================
   愛丁堡專用樣式
   ========================================= */
.result-summary { display: flex; gap: 20px; margin-bottom: 20px; background-color: #fcfcfc; padding: 20px; border-radius: 8px; border: 1px solid #eee; align-items: center; }
.score-box { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; flex-shrink: 0; }
.score-val { font-size: 28px; font-weight: bold; line-height: 1; }
.score-label { font-size: 12px; opacity: 0.9; }
.status-normal { background-color: #27ae60; }
.status-warning { background-color: #f39c12; }
.status-danger { background-color: #c0392b; }
.feedback-box h4 { margin: 0 0 5px 0; color: #333; }
.feedback-box p { margin: 0; color: #666; line-height: 1.5; }
.qa-item { border-bottom: 1px dashed #eee; padding: 10px 0; }
.qa-item:last-child { border-bottom: none; }
.qa-question { font-weight: bold; color: #444; margin: 0 0 5px 0; }
.qa-answer { display: flex; align-items: center; font-size: 14px; }
.ans-label { color: #888; margin-right: 5px; }
.ans-text { color: #2980b9; font-weight: 500; margin-right: 8px; }
.ans-score { color: #999; font-size: 12px; }

/* =========================================
   產前衛教內容樣式 (內嵌於 card-body)
   ========================================= */

/* 基本資料 Grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item { font-size: 15px; color: #444; }
.info-item label { font-weight: bold; color: #555; margin-right: 5px; }

/* 健康行為列表 */
.readonly-list { list-style: none; padding: 0; margin: 0; }
.readonly-list li { margin-bottom: 8px; font-size: 15px; color: #333; border-bottom: 1px dashed #f0f0f0; padding-bottom: 8px;}
.readonly-list label { font-weight: bold; color: #666; display: inline-block; width: 100px; }
.sub-list { margin-left: 100px; margin-top: 5px; color: #555; font-size: 14px; background: #fafafa; padding: 8px; border-radius: 4px;}
.sub-list p { margin: 3px 0; }

/* 醫療病史 */
.text-alert { color: #c0392b; font-weight: bold; }
.text-safe { color: #27ae60; font-weight: bold; }
.selected-tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
.tag { background: #fdf2f2; color: #c0392b; padding: 4px 10px; border-radius: 15px; font-size: 13px; border: 1px solid #fadbd8; }

/* 衛教指導 (內容層) */
.edu-readonly-group { margin-bottom: 25px; }
/* 這裡的副標題改為橫式，位於卡片內容內 */
.edu-sub-title {
  font-weight: bold; color: #3d4758; margin-bottom: 10px; font-size: 16px;
  border-left: 4px solid #3d4758; padding-left: 8px;
}
.edu-detail-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 10px 0; border-bottom: 1px dashed #eee;
}
.edu-detail-row:last-child { border-bottom: none; }
.edu-question-text { flex: 1; font-size: 15px; color: #555; line-height: 1.5; padding-right: 15px; }
.edu-status-tag { flex-shrink: 0; }

.status-badge {
  display: inline-block; padding: 4px 3px; border-radius: 20px;
  font-size: 13px; color: white; font-weight: 500; min-width: 60px; text-align: center;
}
.bg-blue { background-color: #3498db; }
.bg-red { background-color: #e85d44; }

/* =========================================
   iPad Air & Tablet (寬度 <= 1024px)
   ========================================= */
@media (max-width: 1024px) {
  .card-body { padding: 20px; }
}

/* =========================================
   iPhone 12/14 Pro/Max (手機版 <= 768px)
   ========================================= */
@media (max-width: 768px) {
  .detail-container { padding-bottom: 30px; }

  /* Header 改為垂直排列 */
  .meta-header { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 15px; 
  }
  .record-title { font-size: 20px; }
  .back-btn { align-self: flex-start; width: 100%; text-align: center; }

  /* 卡片改為垂直堆疊 (上標題、下內容) */
  .form-card { flex-direction: column; }
  
  .card-label { 
    width: 100%; 
    height: auto; 
    writing-mode: horizontal-tb; /* 改橫書 */
    flex-direction: row; 
    justify-content: flex-start;
    padding: 12px 20px; 
    border-right: none; 
    border-bottom: 1px solid #e2e8f0;
    letter-spacing: 1px;
    font-size: 16px;
  }
  
  .card-body { padding: 20px; }

  /* 愛丁堡結果摘要：垂直堆疊 */
  .result-summary { 
    flex-direction: column; 
    text-align: center; 
    padding: 30px 20px;
  }
  .feedback-box h4 { text-align: center; margin-top: 10px;}
  .feedback-box p { text-align: left; }

  /* 資訊 Grid 改單欄 */
  .info-grid { grid-template-columns: 1fr; gap: 12px; }
  
  /* 健康行為列表優化 */
  .readonly-list label { display: block; margin-bottom: 4px; color: #64748b; font-size: 14px;}
  .sub-list { margin-left: 0; background-color: #f1f5f9; }

  /* 衛教指導優化 */
  .edu-detail-row {
    flex-direction: column; /* 題目與標籤垂直排列 */
    gap: 8px;
    align-items: flex-start;
  }
  .edu-question-text { padding-right: 0; }
  .edu-status-tag { align-self: flex-end; /* 標籤靠右下 */ }
}
</style>