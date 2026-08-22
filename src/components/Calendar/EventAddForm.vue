<template>
  <!-- 遮罩層 -->
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <!-- 彈窗內容 -->
      <div class="modal-container" @click.stop>
        <!-- 標題列 -->
        <div class="modal-header">
            <h3 class="modal-title">新增行程</h3>
            <button class="close-btn" @click="closeModal">✕</button>
        </div>

        <!-- 內容區 -->
        <div class="modal-body">
          <form @submit.prevent="saveEvent">
            <!-- 提示訊息 -->
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            <!-- 標題 -->
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>標題
              </label>
              <input
                v-model="formData.title"
                type="text"
                class="form-input"
                placeholder="請輸入行程標題"
                required
              />
            </div>

            <!-- 類型 -->
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>類型
              </label>
              <select v-model="formData.type" class="form-select" required>
                <option value="">請選擇類型</option>
                <option value="checkup">產檢</option>
                <option value="appointment">預約</option>
                <option value="reminder">提醒</option>
                <option value="other">其他</option>
              </select>
            </div>

            <!-- 日期範圍 -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>📅開始日期
                </label>
                <input
                  v-model="formData.startDate"
                  type="date"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>📅結束日期
                </label>
                <input
                  v-model="formData.endDate"
                  type="date"
                  class="form-input"
                  required
                />
              </div>
            </div>
            
            <!-- 時間範圍 -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>🕛開始時間
                </label>
                <input
                  v-model="formData.startTime"
                  type="time"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>🕛結束時間
                </label>
                <input
                  v-model="formData.endTime"
                  type="time"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <!-- 地點 -->
            <div class="form-group">
              <label class="form-label">🗺️地點</label>
              <input
                v-model="formData.location"
                type="text"
                class="form-input"
                placeholder="請輸入地點"
              />
            </div>

            <!-- 備註 -->
            <div class="form-group">
              <label class="form-label">📑備註</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                rows="4"
                placeholder="請輸入備註說明"
              ></textarea>
            </div>
          </form>
        </div>

        <!-- 底部按鈕 -->
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeModal">
            取消
          </button>
          <button type="button" class="btn-save" @click="saveEvent">
            新增行程
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  defaultDate: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close', 'save'])

// 表單資料
const formData = ref({
  title: '',
  type: '',
  startDate: '',
  endDate:'',
  startTime: '',
  endTime: '',
  location: '',
  description: ''
})

// 錯誤訊息
const errorMessage = ref('')
const successMessage = ref('')

// 監聽顯示狀態，重置行程表單
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
    // 如果有預設日期，使用它
    if (props.defaultDate) {
      formData.value.startDate = props.defaultDate
    } else {
      // 否則使用今天
      formData.value.startDate = dayjs().format('YYYY-MM-DD')
    }
  }
})

// 結束日期大多與開始日期相同時的處理
watch(() => formData.value.startDate, (newStartDate, oldStartDate) => {
  if (!formData.value.endDate || formData.value.endDate === oldStartDate) {
    formData.value.endDate = newStartDate;
  } 
  else if (dayjs(formData.value.endDate).isBefore(dayjs(newStartDate))) {
    formData.value.endDate = newStartDate;
  }
});

// 重置行程表單
function resetForm() {
  const today = dayjs().format('YYYY-MM-DD')

  formData.value = {
    title: '',
    type: '',
    startDate: today,
    endDate: today,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: ''
  }
  errorMessage.value = ''
  successMessage.value = ''
}

// 關閉彈窗
function closeModal() {
  emit('close')
}

// 驗證表單
function validateForm() {
  // 檢查必填欄位
  if (!formData.value.title.trim()) {
    errorMessage.value = '請輸入標題'
    return false
  }

  if (!formData.value.type) {
    errorMessage.value = '請選擇類型'
    return false
  }

  if (!formData.value.startDate) {
    errorMessage.value = '請選擇日期'
    return false
  }

  if (!formData.value.startTime || !formData.value.endTime) {
    errorMessage.value = '請輸入開始和結束時間'
    return false
  }

  if (!formData.value.startDate || !formData.value.endDate) {
    errorMessage.value = '請選擇開始與結束日期'
    return false
  }

  // 檢查時間邏輯
  const startDateTime = dayjs(`${formData.value.startDate} ${formData.value.startTime}`)
  const endDateTime = dayjs(`${formData.value.endDate} ${formData.value.endTime}`)

  // 跨日行程
  if (!endDateTime.isAfter(startDateTime)) {
    errorMessage.value = '結束時間必須晚於開始時間（請檢查日期與時間）'
    return false
  }

  errorMessage.value = ''
  return true
}

// 儲存事件
function saveEvent() {
  if (!validateForm()) {
    return
  }

  // 準備新事件資料
  const newEvent = {
    id: Date.now(), // 使用時間戳作為臨時 ID
    title: formData.value.title,
    type: formData.value.type,
    //date: formData.value.startDate,
    startDate: formData.value.startDate,
    endDate: formData.value.endDate,
    startTime: formData.value.startTime,
    endTime: formData.value.endTime,
    location: formData.value.location,
    description: formData.value.description
  }

  console.log('新增行程:', newEvent)
  
  // 顯示成功訊息
  successMessage.value = 'true'
  alert('行程已新增！')
  
  // 發送事件
  emit('save', newEvent)
  
  // 延遲關閉，讓用戶看到成功訊息
  setTimeout(() => {
    closeModal()
  }, 1000)
}
</script>

<style scoped>
/* 彈窗遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* 彈窗容器 */
.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* 標題列 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #5eb3e4 0%, #4a9fd4 100%);
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #986464;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: rig;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #333;
}

.modal-title {
  font-size: 22px;
  color: white;
  margin: 0;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #fffcfc;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #333;
}

.close-btn:active {
  transform: scale(0.95);
}

/* 內容區 */
.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

/* 表單樣式 */
.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  text-align: left;
}

.required {
  color: #ff4757;
  margin-right: 4px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #5eb3e4;
  box-shadow: 0 0 0 3px rgba(94, 179, 228, 0.1);
}

.form-select {
  cursor: pointer;
  background: white;
}

.form-textarea {
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #5eb3e4;
  box-shadow: 0 0 0 3px rgba(94, 179, 228, 0.1);
}

/* 表單行（並排） */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

/* 錯誤訊息 */
.error-message {
  background: #ffe5e5;
  border: 1px solid #ff4757;
  color: #ff4757;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-message::before {
  content: '⚠️';
}

/* 底部按鈕 */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-save {
  background: #5eb3e4;
  color: white;
  box-shadow: 0 2px 4px rgba(94, 179, 228, 0.3);
}

.btn-save:hover {
  background: #4a9fd4;
  box-shadow: 0 4px 8px rgba(94, 179, 228, 0.4);
}

/* 動畫效果 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* iPhone 12 Pro  */
@media (max-width: 400px){
  .modal-overlay {
    padding: 0; 
  }
  
  .modal-container {
    max-width: 500px; 
    max-height: 100vh; 
    border-radius: 0;
  }
  .modal-header {
    padding: 15px; 
  }
  
  .modal-title {
    font-size: 120%; 
  }

  .back-btn {
      padding: 6px 10px;
      font-size: 15px;
  }

  .close-btn {
    width: 40px;
    height: 40px;
    font-size: 22px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr; 
    gap: 0; 
  }

  .form-row .form-group {
    margin-bottom: 20px;
  }
  
  .form-row .form-group:last-child {
      margin-bottom: 0;
  }

  .form-label {
    font-size: 16px;
    margin-bottom: 6px;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    padding: 8px 10px;
    font-size: 15px;

  }

  .modal-footer {
    flex-direction: column;
    gap: 8px; 
    padding: 10px 15px;
  }
  
  .btn-cancel,
  .btn-save {
    padding: 10px; 
    font-size: 14px;
  }
}

/* iPhone 14 Pro Max */
@media(min-width: 400px) and (max-width: 450px){
  .modal-overlay {
    padding: 0; 
  }
  
  .modal-container {
    max-width: 500px; 
    max-height: 100vh; 
    border-radius: 0;
  }
  .modal-header {
    padding: 18px; 
  }
  
  .modal-title {
    font-size: 130%; 
  }

  .back-btn {
    padding: 6px 12px;
    font-size: 18px;
  }

  .close-btn {
    width: 40px;
    height: 40px;
    font-size: 22px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr; 
    gap: 0; 
  }

  .form-row .form-group {
    margin-bottom: 22px;
  }
  
  .form-row .form-group:last-child {
      margin-bottom: 0;
  }

  .form-label {
    font-size: 18px;
    margin-bottom: 6px;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    padding: 8px 10px;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 10px; 
    padding: 10px 15px;
  }
  
  .btn-cancel,
  .btn-save {
    padding: 10px; 
    font-size: 16px;
  }
}

/* iPad Air*/
@media (min-width: 750px) and (max-width: 820px){
  .modal-overlay {
    padding: 0; 
  }
  
  .modal-container {
    max-width: 630px; 
    max-height: 85vh; 
    border-radius: 10px;
  }
  .modal-header {
    padding: 25px; 
  }
  
  .modal-title {
    font-size: 28px; 
  }

  .back-btn {
    padding: 6px 12px;
    font-size: 22px;
  }

  .close-btn {
    width: 40px;
    height: 40px;
    font-size: 22px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr; 
    gap: 0; 
  }

  .form-row .form-group {
    margin-bottom: 22px;
  }
  
  .form-row .form-group:last-child {
      margin-bottom: 0;
  }

  .form-label {
    font-size: 22px;
    margin-bottom: 6px;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    padding: 8px 10px;
    font-size: 20px;
    margin-bottom: 8px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 10px; 
    padding: 10px 15px;
  }
  
  .btn-cancel,
  .btn-save {
    padding: 10px; 
    font-size: 20px;
  }
}
</style>
