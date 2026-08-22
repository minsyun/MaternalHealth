<template>
    <AssessmentPanel ref="panelRef" title="孕婦產前健康照護衛教指導紀錄表" subtitle="( 適用週數：第 29 週 ~ 第 40 週 )">
        <AssessmentProgressBar :completionRate="completionRate" />
        <div v-show="currentStep === 1" class="form-card">
            <div class="card-label">基本資料</div>
            <div class="card-body">
                <div class="row">
                    <div class="form-group col-6">
                        <label>姓名</label>
                        <input type="text" v-model="form.name" placeholder="請輸入姓名">
                    </div>
                    <div class="form-group col-6">
                        <label>身分證字號(外籍人士護照號碼)</label>
                        <input type="text" v-model="form.idNumber" placeholder="請輸入身分證字號">
                    </div>
                </div>
            
                <div class="row">
                    <div class="form-group col-6">
                        <label>出生日期</label>
                        <input type="date" v-model="form.birthDate">
                    </div>
                    <div class="form-group col-6">
                        <label>聯絡地址</label>
                        <input type="text" v-model="form.address" placeholder="請輸入聯絡地址">
                    </div>
                </div>

                <div class="row">
                    <div class="form-group col-6">
                        <label>手機號碼</label>
                        <input type="tel" v-model="form.phone" placeholder="09xx-xxx-xxx">
                    </div>
                    <div class="form-group col-6">
                        <label>住家電話</label>
                        <input type="tel" v-model="form.homePhone" placeholder="請輸入住家電話">
                    </div>
                
                </div>
            </div>
        </div>

        <div v-show="currentStep === 2" class="form-card">
            <div class="card-label">健康行為</div>
            <div class="card-body">
            
                <div class="question-item">
                    <p class="q-title">1. 您目前是否吸菸？</p>
                    <div class="radio-group">
                        <label><input type="radio" v-model="form.behavior.smoking" :value="0">否</label>
                        <label><input type="radio" v-model="form.behavior.smoking" :value="1">偶爾或應酬才吸</label>
                        <label><input type="radio" v-model="form.behavior.smoking" :value="2">平均一天約吸一包菸(20支含)以下</label>
                        <label><input type="radio" v-model="form.behavior.smoking" :value="3">平均一天約吸一包菸以上</label>
                    </div>
                </div>

                <div class="question-item">
                    <p class="q-title">2. 您是否特別注意遠離二手菸的環境？</p>
                    <div class="radio-group">
                        <label><input type="radio" v-model="form.behavior.secondhandSmoke" :value="0">否</label>
                        <label><input type="radio" v-model="form.behavior.secondhandSmoke" :value="1">是</label>
                        <label><input type="radio" v-model="form.behavior.secondhandSmoke" :value="2">周遭環境沒有二手菸</label>
                    </div>
                </div>

                <div class="question-item">
                    <p class="q-title">3. 您目前是否喝酒？</p>
                    <div class="radio-group">
                        <label><input type="radio" v-model="form.behavior.drinking" :value="0">否</label>
                        <label><input type="radio" v-model="form.behavior.drinking" :value="1">偶爾或應酬才喝</label>
                        <label><input type="radio" v-model="form.behavior.drinking" :value="2">經常喝</label>
                    </div>
                </div>

                <div class="question-item">
                    <p class="q-title">4. 您是否嚼檳榔？</p>
                    <div class="radio-group">
                        <label><input type="radio" v-model="form.behavior.betelNut" :value="0">否</label>
                        <label><input type="radio" v-model="form.behavior.betelNut" :value="1">偶爾或應酬才嚼</label>
                        <label><input type="radio" v-model="form.behavior.betelNut" :value="2">經常嚼</label>
                    </div>
                </div>

                <div class="question-item">
                    <p class="q-title">5. 您是否曾使用毒品？</p>
                    <div class="radio-group">
                        <label><input type="radio" v-model="form.behavior.drugs" :value="0">否</label>
                        <label><input type="radio" v-model="form.behavior.drugs" :value="1">是</label>
                    </div>
                </div>

                <div class="question-item">
                    <p class="q-title">6. 憂鬱檢測：</p>
                    
                    <div class="sub-question-block">
                        <p class="sub-q-text">過去一個月，是否常被情緒低落、憂鬱或感覺未來沒有希望所困擾？</p>
                        <div class="radio-group">
                            <label><input type="radio" v-model="form.behavior.depression1" :value="0"> 否</label>
                            <label><input type="radio" v-model="form.behavior.depression1" :value="1"> 是</label>
                        </div>
                    </div>

                    <div class="sub-question-block">
                        <p class="sub-q-text">過去一個月，是否常對事物失去興趣或做事沒有愉悅感？</p>
                        <div class="radio-group">
                            <label><input type="radio" v-model="form.behavior.depression2" :value="0"> 否</label>
                            <label><input type="radio" v-model="form.behavior.depression2" :value="1"> 是</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-show="currentStep === 3" class="form-card">
            <div class="card-label">孕產婦醫療史</div>
            <div class="card-body">
                <p class="q-title">過去是否有相關孕產醫療史？</p>
                <div class="radio-group mb-3">
                    <label><input type="radio" v-model="form.medicalHistory.hasHistory" :value="false"> 否</label>
                    <label><input type="radio" v-model="form.medicalHistory.hasHistory" :value="true">是 (請勾選下方項目)</label>
                </div>

                <div v-if="form.medicalHistory.hasHistory" class="history-checklist">
                    <div class="history-grid mb-4">
                        <label v-for="item in generalMedicalOptions" :key="item.id" class="check-label">
                            <input type="checkbox" v-model="form.medicalHistory.selectedItems" :value="item.id">
                            {{ item.label }}
                            <input 
                                v-if="item.id === '11' && form.medicalHistory.selectedItems.includes('11')"
                                type="text" 
                                v-model="form.medicalHistory.otherNote" 
                                class="inline-input" 
                                placeholder="請說明"
                                @click.stop
                            >
                        </label>
                    </div>

                    <transition name="slide-fade">
                        <div v-if="isSevereComplicationChecked" class="complication-section">
                            <p class="complication-title">請勾選嚴重合併症細項：</p>
                            <div class="history-grid">
                                <label v-for="item in seriousComplications" :key="item.id" class="check-label">
                                    <input type="checkbox" v-model="form.medicalHistory.selectedItems" :value="item.id">
                                    {{ item.label }}
                                </label>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>

        <div v-show="currentStep === 4" class="form-card">
            <div class="card-label">衛教指導</div>
            <div class="card-body">
                <p class="hint-text">請準媽媽自我評估是否清楚下列指導重點(第 1~3 大題)：</p>
                
                <div v-for="(topic, index) in educationTopics.slice(0, 3)" :key="topic.title" class="edu-topic">
                    <h4 class="topic-title">{{ topic.title }}</h4>
                    <div class="topic-items">
                        <div v-for="(point, pIndex) in topic.points" :key="pIndex" class="edu-item-row">
                            <p class="edu-text">{{ point.text }}</p>
                            
                            <div class="edu-radio-group">
                                <label class="radio-label">
                                    <input 
                                        type="radio" 
                                        :name="`edu-${index}-${pIndex}`" 
                                        v-model="point.value" 
                                        :value="1"
                                    > 
                                    清楚
                                </label>
                                <label class="radio-label">
                                    <input 
                                        type="radio" 
                                        :name="`edu-${index}-${pIndex}`" 
                                        v-model="point.value" 
                                        :value="0"
                                    > 
                                    不清楚
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div v-show="currentStep === 5" class="form-card">
            <div class="card-label">衛教指導</div>
            <div class="card-body">
                <p class="hint-text">請準媽媽自我評估是否清楚下列指導重點 (第 4~6 大題)：</p>
                
                <div v-for="(topic, index) in educationTopics.slice(3)" :key="topic.title" class="edu-topic">
                  <h4 class="topic-title">{{ topic.title }}</h4>
                  <div class="topic-items">
                      <div v-for="(point, pIndex) in topic.points" :key="pIndex" class="edu-item-row">
                        <p class="edu-text">{{ point.text }}</p>
                        <div class="edu-radio-group">
                            <label class="radio-label">
                              <input type="radio" :name="`edu-${index + 3}-${pIndex}`" v-model="point.value" :value="1"> 清楚
                            </label>
                            <label class="radio-label">
                              <input type="radio" :name="`edu-${index + 3}-${pIndex}`" v-model="point.value" :value="0"> 不清楚
                            </label>
                        </div>
                      </div>
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

        <div v-if="showSuccessModal" class="modal-overlay">
        
            <div class="modal-box">
                <button class="modal-close" @click="closeModal">×</button>

                <div class="modal-content">
                    <img src="https://res.cloudinary.com/dfrjrvt44/image/upload/v1769574284/success_kjzrgr.png" alt="送出成功" class="modal-icon" />
                    <h3 class="modal-title" style="color: #333;">送出成功</h3>
                </div>
            </div>
        </div>
    </AssessmentPanel>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 
import AssessmentPanel from '../components/AssessmentPanel.vue';
import AssessmentProgressBar from '../components/AssessmentProgressBar.vue';
import api from '../services/api.js';
// 引入 JSON 資料
import prenatalQuestions from '../assets/data/prenatalQuestions.json'; 

// 初始化 router
const router = useRouter();

//  取得當前登入者 ID 的輔助函式
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

// 使用 JSON 資料初始化變數
const generalMedicalOptions = prenatalQuestions.generalMedicalOptions;
const seriousComplications = prenatalQuestions.seriousComplications;
// 因為 educationTopics 裡的 value 需要響應式 (v-model 綁定)
// 用 reactive 包起來，或是深拷貝一份
const educationTopics = reactive(JSON.parse(JSON.stringify(prenatalQuestions.educationTopics)));

// 定義步驟狀態
const currentStep = ref(1);
const totalSteps = 5;
const panelRef = ref(null);

// 表單資料模型
const form = reactive({
  name: '',
  idNumber: '',
  birthDate: '',
  phone: '',
  homePhone: '', 
  address: '',   
  behavior: {
    smoking: null,
    secondhandSmoke: null,
    drinking: null,
    betelNut: null,
    drugs: null,    
    depression1: null,
    depression2: null
  },
  medicalHistory: {
    hasHistory: null,
    selectedItems: [],
    otherNote: '',
  }
});

// 2.下一頁與上一頁的函式
const nextStep = () => {
  // 先驗證當前頁面有沒有填寫完整
  if (validateCurrentStep()) {
    currentStep.value++;
    panelRef.value?.scrollToTop(); // 跳頁後滾回頂部
  }
};
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    panelRef.value?.scrollToTop();
  }
};
// 3. 分頁驗證邏輯 (將原本 submitForm 的檢查拆開)
const validateCurrentStep = () => {
  if (currentStep.value === 1) {
    // 檢查基本資料
    const basicFields = ['name', 'idNumber', 'birthDate', 'phone', 'address'];
    const missing = basicFields.some(field => !form[field] || form[field].trim() === '');
    if (missing) {
      alert('請填寫完整基本資料');
      return false;
    }
  } else if (currentStep.value === 2) {
    // 檢查健康行為
    const behaviorFields = ['smoking', 'secondhandSmoke', 'drinking', 'betelNut', 'drugs', 'depression1', 'depression2'];
    const unfinished = behaviorFields.some(field => form.behavior[field] === null);
    if (unfinished) {
      alert('請完成所有健康行為與憂鬱檢測問題');
      return false;
    }
  } else if (currentStep.value === 3) {
    // 檢查醫療史
    if (form.medicalHistory.hasHistory === null) {
      alert('請選擇是否有孕產婦醫療史');
      return false;
    }
  }
  // 步驟 4 的驗證 (衛教指導前半部)
  else if (currentStep.value === 4) {
    // 取出前 3 個主題檢查
    const part1Topics = educationTopics.slice(0, 3);
    let allAnswered = true;
    
    // 檢查每一個題目是否都有選填 (value !== null)
    part1Topics.forEach(topic => {
      topic.points.forEach(point => {
        if (point.value === null) allAnswered = false;
      });
    });

    if (!allAnswered) {
      alert('請完成本頁所有的衛教指導評估題目');
      return false;
    }
  }
  
  return true;
};



// 計算填寫進度
const completionRate = computed(() => {
  let filledCount = 0;
  let totalCount = 0;

  // 1. 檢查基本資料 (6項)
  const basicFields = ['name', 'idNumber', 'birthDate', 'phone', 'homePhone', 'address'];
  basicFields.forEach(field => {
    totalCount++;
    if (form[field] && form[field].trim() !== '') filledCount++;
  });

  // 2. 檢查健康行為 (5項習慣 + 2項憂鬱 = 7項)
  // Radio Button，值為 0 或 1 都算已填，只有 null 算未填
  const behaviorFields = ['smoking', 'secondhandSmoke', 'drinking', 'betelNut', 'drugs', 'depression1', 'depression2'];
  behaviorFields.forEach(field => {
    totalCount++;
    if (form.behavior[field] !== null) filledCount++;
  });

  // 3. 檢查醫療病史 (1項)
  // 只檢查最外層的「是否有病史」開關
  totalCount++;
  if (form.medicalHistory.hasHistory !== null) filledCount++;

  // 4. 檢查衛教指導 (6大題共 18小題)
  educationTopics.forEach(topic => {
    topic.points.forEach(point => {
      totalCount++;
      if (point.value !== null) filledCount++;
    });
  });

  // 計算百分比
  if (totalCount === 0) return 0;
  return Math.round((filledCount / totalCount) * 100);
});

// 判斷是否勾選了第 8 項
const isSevereComplicationChecked = computed(() => {
  return form.medicalHistory.selectedItems.includes('8');
});

// 控制彈窗顯示的狀態
const showSuccessModal = ref(false);

// --- 從後端 API 自動代入基本資料 ---
onMounted(async () => {
  try {
    // 動態獲取 userId 進行資料代入
    const userId = getCurrentUserId();
    const response = await api.get(`http://192.168.100.6:3000/api/personal_information/${userId}`);
    const result = response.data;

    if (result.success && result.data) {
      const p = result.data;
      
      // 執行欄位對應
      if (p.userName) form.name = p.userName;
      if (p.idNumber) form.idNumber = p.idNumber;
      
      // 處理日期格式：HTML5 <input type="date"> 只接受 YYYY-MM-DD
      if (p.birthday) {
        form.birthDate = p.birthday.replace(/\//g, '-');
      }
      
      if (p.phone) form.phone = p.phone;
      if (p.homePhone) form.homePhone = p.homePhone;
      if (p.address) form.address = p.address;
      
      console.log("產前表單基本資料代入成功");
    }
  } catch (error) {
    console.error("從後端抓取資料失敗，執行本地備案:", error);
    // 備案：若 API 失敗，可嘗試從 localStorage 讀取
    const saved = JSON.parse(localStorage.getItem("userProfile") || '{}');
    if (saved.name) form.name = saved.name;
  }
});

const submitForm = async () => {
  // 驗證邏輯 (維持你原有的驗證)
  if (completionRate.value < 100) {
    alert('您還有題目尚未完成，請檢查所有題目。');
    return;
  }

  try {
    // 動態獲取 userId 來送出表單
    const userId = getCurrentUserId();

    const response = await api.post("http://192.168.100.6:3000/api/submit_prenatal", {
      user_id: userId,
      form: form,              // 包含基本資料、行為、病史
      educationTopics: educationTopics // 18 題衛教資料
    });

    const result = response.data;

    if (result.success) {
      showSuccessModal.value = true;
    } else {
      alert("儲存失敗：" + result.message);
    }
  } catch (error) {
    console.error("連線錯誤：", error);
    alert("無法連線至伺服器");
  }
};

// 關閉彈窗函式
const closeModal = () => {
  // 如果是「成功視窗」被關閉
  if (showSuccessModal.value) {
    showSuccessModal.value = false;
    
    // 跳轉至歷史填寫紀錄頁面
    router.push('/self-assessment/history'); 
  } 
};
</script>

<style scoped>
/* 導航按鈕區塊 */
.navigation-buttons {
  display: flex;
  justify-content: center; /* 按鈕置中 */
  gap: 20px;
  margin-top: 30px;
  padding: 20px 0;
}

/* 按鈕共用樣式 */
.nav-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 50px; /* 圓角 */
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* 上一頁按鈕 - 灰色 */
.btn-prev {
  background-color: #e2e8f0;
  color: #4a5568;
}
.btn-prev:hover {
  background-color: #cbd5e0;
}

/* 下一頁按鈕 - 藍色 */
.btn-next {
  background-color: #3498db;
  color: white;
}
.btn-next:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

/* 送出按鈕 - 綠色 */
.btn-submit {
  background-color: #3498db;
  color: white;
}
.btn-submit:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

/* Form Card */
.form-card {
  background-color: white;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card-label {
  background-color: #f0f4f8;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-lr;
  letter-spacing: 3px;
  font-weight: bold;
  color: #4a5568;
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
  padding: 10px 0;
}

.card-body {
  flex-grow: 1;
  padding: 20px;
}

/* Grid System for Inputs */
.row { display: flex; gap: 20px; margin-bottom: 15px; }
.col-6 { flex: 1; }
.col-12 { width: 100%; } /* 新增 Full Width 樣式 */

.form-group label { display: block; margin-bottom: 5px; color: #444; font-size: 14px; font-weight: bold; }
.form-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;}

/* Questions */
.question-item { margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }
.question-item:last-child { border-bottom: none; }
.q-title { font-weight: bold; color: #444; margin-bottom: 8px; }

/* Radio Group */
.radio-group { display: flex; flex-wrap: wrap; gap: 15px; }
.radio-group label { display: flex; align-items: center; cursor: pointer; color: #555; }
.radio-group input { margin-right: 6px; }

/* 憂鬱檢測小題的區塊樣式 */
.sub-question-block {
    margin-bottom: 15px; /* 小題之間的間距 */
    padding-left: 5px;   /* 稍微縮排 */
}

/* 讓小題的文字與 Radio Group 分開一點 */
.sub-q-text {
    margin-bottom: 8px;
    color: #555;
    font-size: 15px;
}

/* 醫療史 */
.history-checklist { background-color: #f8fafc; padding: 15px; border-radius: 4px; margin-top: 10px; border: 1px solid #e2e8f0; }
.history-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.check-label { display: flex; align-items: flex-start; font-size: 14px; color: #555; cursor: pointer; }
.check-label input { margin-top: 3px; margin-right: 6px; }

/* 衛教指導區塊樣式調整 */
.edu-topic { 
    margin-bottom: 25px; 
}

.topic-title { 
    font-size: 16px; 
    color: #2c3e50; 
    border-left: 4px solid #3498db; 
    padding-left: 10px; 
    margin-bottom: 15px; 
}

/* 每一題的容器 */
.edu-item-row {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px dashed #eee; /* 虛線分隔每題 */
}

.edu-item-row:last-child {
    border-bottom: none;
}

/* 題目文字 */
.edu-text { 
    font-size: 15px; 
    color: #555; 
    line-height: 1.6; 
    margin-bottom: 10px; /* 文字與選項的間距 */
}

/* 清楚/不清楚 選項區 */
.edu-radio-group {
    display: flex;
    gap: 20px; /* 選項之間的間距 */
}

.radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: #444;
}

.radio-label input {
    margin-right: 6px;
    width: 16px;
    height: 16px;
    accent-color: #3498db; /* 選中時的藍色 */
}

.mb-4 {
  margin-bottom: 20px;
}

.opt-id {
  font-weight: bold;
  color: #3498db;
  margin-right: 4px;
}

/* 嚴重合併症區塊樣式 */
.complication-section {
  background-color: #fff4f4; 
  border: 1px solid #f5c6cb;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.complication-title {
  font-weight: bold;
  color: #c0392b;
  margin-bottom: 10px;
  font-size: 14px;
}

/* 簡單的滑動淡入動畫 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}


/* 勾選其他的行內輸入框樣式 */
.inline-input {
    border: none;
    border-bottom: 1px solid #999; /* 只有底線 */
    background: transparent;
    margin-left: 8px;
    padding: 2px 5px;
    font-size: 14px;
    width: 120px; /* 控制寬度 */
    outline: none;
    transition: border-color 0.3s;
}

.inline-input:focus {
    border-bottom-color: #3498db; /* 聚焦時變色 */
}

/* 讓 Label 能夠包容輸入框而不換行，或視情況換行 */
.check-label {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #555;
    cursor: pointer;
    line-height: 1.4;
    flex-wrap: wrap; /* 允許輸入框換行，避免手機版跑版 */
}

/* --- 彈窗內容樣式 --- */
/* 全螢幕遮罩 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4); /* 半透明黑底 */
    display: flex;
    justify-content: center; /* 水平置中 */
    align-items: center;     /* 垂直置中 */
    z-index: 9999;           /* 確保在最上層 */
    /* 背景模糊效果 */
    /* backdrop-filter: blur(2px);  */
}

/* 白色視窗本體 */
.modal-box {
    background-color: white;
    width: 320px;
    padding: 40px 30px;
    border-radius: 4px;
    position: relative;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    text-align: center;
    animation: popIn 0.3s ease-out;
}

/* 關閉按鈕 */
.modal-close {
    position: absolute;
    top: 0;
    right: 0;
    background: #dbe2e8;
    border: none;
    font-size: 24px;
    color: #666;
    width: 36px;
    height: 36px;
    cursor: pointer;
    line-height: 36px;
    transition: 0.2s;
}
.modal-close:hover {
    background: #cbd5e0;
}

/* 彈出動畫 */
@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
/* 控制圖片大小 */
.modal-icon {
    width: 80px;  
    height: auto; /* 維持比例 */
    margin-bottom: 15px;
    object-fit: contain;
}

.modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.modal-title {
    font-size: 22px;
    font-weight: bold;
    margin: 0;
    letter-spacing: 1px;
}

/* --- 平板 (iPad Air, 1024px 以下) --- */
@media (max-width: 1024px) {
  .card-body {
    padding: 20px; /* 稍微縮小內距 */
  }
}

/* --- 手機版 (iPhone 12/14 Pro Max, 768px 以下) --- */
@media (max-width: 768px) {
  .navigation-buttons {
    flex-direction: column-reverse; /* 手機上把上一頁放在下面，比較好按 */
    gap: 15px;
  }
  .nav-btn {
    width: 100%; /* 按鈕滿寬 */
  }
  /* 1. 卡片佈局重組：左標題變上標題 */
  .form-card {
    flex-direction: column; /* 改為垂直排列 */
  }

  .card-label {
    width: 100%;       /* 寬度滿版 */
    height: auto;      /* 高度自動 */
    writing-mode: horizontal-tb; /* 文字改為橫書 */
    flex-direction: row; /* 內容橫向排列 */
    justify-content: flex-start; /* 靠左對齊 */
    padding: 12px 20px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    letter-spacing: 1px;
    font-size: 16px;
  }

  /* 2. 輸入框 Grid 堆疊 */
  .row {
    flex-direction: column; /* 雙欄變單欄 */
    gap: 15px;
  }
  
  .col-6 {
    width: 100%; /* 確保滿版 */
  }
  
  /* 增加輸入框高度，方便手指點擊 */
  .form-group input {
    padding: 12px; 
  }

  /* 3. 醫療史與 Checkbox */
  .history-grid {
    grid-template-columns: 1fr; /* 改為單欄，避免 Checkbox 文字擠壓 */
    gap: 12px;
  }
  
  /* 讓「其他」輸入框在手機上換行顯示，避免寬度不足 */
  .check-label {
    flex-wrap: wrap; 
  }
  .inline-input {
    width: 100%; /* 輸入框滿版 */
    margin-left: 0;
    margin-top: 5px;
    border-bottom: 1px dashed #94a3b8;
  }

  /* 4. Radio Button 優化 */
  .radio-group {
    gap: 15px;
  }
  .radio-group label {
    width: 100%; /* 選項佔滿一行，避免誤觸 */
    padding: 5px 0;
  }

  /* 5. 衛教指導 */
  .edu-item-row {
    padding-bottom: 20px;
  }
  .edu-radio-group {
    justify-content: flex-start;
    gap: 40px; /* 拉大「清楚/不清楚」的間距 */
  }
  
  /* 彈窗微調 */
  .modal-box {
    width: 85%; /* 手機上不設固定寬度，改百分比 */
    padding: 30px 20px;
  }
}
</style>