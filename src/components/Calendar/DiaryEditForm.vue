<template>
  <!-- 遮罩層 -->
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <!-- 彈窗內容 -->
      <div class="modal-container" @click.stop>
        <!-- 標題列 -->
        <div class="modal-header">
          <h3 class="modal-title">編輯日記</h3>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>

        <!-- 內容區 -->
        <div class="modal-body">
          <form @submit.prevent="saveDiary">
            <!-- 提示訊息 -->
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <!-- 日期 -->
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>📅日期
              </label>
              <input
                v-model="formData.date"
                type="date"
                class="form-input"
                required
              />
            </div>

            <!-- 標題 -->
            <div class="form-group">
              <label class="form-label">標題</label>
              <input
                v-model="formData.title"
                type="text"
                class="form-input"
                placeholder="今天的故事要叫什麼名字呢？"
              />
            </div>

            <!-- 內容 -->
            <div class="form-group">
              <label class="form-label">內容</label>
              <textarea
                v-model="formData.content"
                class="form-textarea"
                rows="6"
                placeholder="把今天的心情和故事留在這裡～"
              ></textarea>
            </div>

            <!-- 圖片上傳 -->
            <div class="form-group">
              <label class="form-label">🖼️照片</label>
              
              <!-- 現有圖片預覽 -->
              <div v-if="formData.imagePreview" class="current-image">
                <div class="image-preview-box">
                  <img :src="formData.imagePreview" alt="日記圖片" />
                  <button 
                    type="button" 
                    class="remove-image-btn" 
                    @click="removeImage"
                    title="移除圖片"
                  >
                    ✕
                  </button>
                </div>
                <p class="image-hint">點擊下方按鈕可更換照片</p>
              </div>

              <!-- 上傳按鈕 -->
              <div class="upload-section">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  style="display: none"
                />
                <button 
                  type="button" 
                  class="upload-btn" 
                  @click="triggerFileUpload"
                >
                  <span class="upload-icon">📷</span>
                  <span>{{ formData.imagePreview ? '更換圖片' : '上傳圖片' }}</span>
                </button>
                <p class="upload-hint">支援 JPG、PNG 格式，檔案大小不超過 5MB</p>
              </div>
            </div>
          </form>
        </div>

        <!-- 底部按鈕 -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn-cancel" 
            @click="closeModal"
            :disabled="isUpdatingDiary"
          >
            取消
          </button>
          <button 
            type="button" 
            class="btn-save" 
            :disabled="isUpdatingDiary"
            @click="saveDiary"
          >
            <span v-if="isUpdatingDiary" class="loading-spinner">
              日記更新中，請稍候～
            </span>
            <span v-else>儲存</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  diary: {
    type: Object,
    default: () => ({})
  },
  isUpdatingDiary: Boolean
})

// Emits
const emit = defineEmits(['close', 'save'])

// 表單資料
const formData = ref({
  id: '',
  date: '',
  title: '',
  content: '',
  imagePreview: null,
  imageFile: null,
  originalImage: null
})

// 錯誤訊息
const errorMessage = ref('')

// 檔案上傳參考
const fileInput = ref(null)

// 監聽 diary 變化，更新表單資料
watch(() => props.diary, (newDiary) => {
  if (newDiary && newDiary.id) {
    formData.value = {
      id: newDiary.id,
      date: newDiary.date || '',
      title: newDiary.title === '今日日記' ? '' : (newDiary.title || ''),
      content: newDiary.content || '',
      imagePreview: newDiary.image || null,
      imageFile: null,
      originalImage: newDiary.image || null
    }
  }
}, { immediate: true, deep: true })

// 關閉彈窗
function closeModal() {
  errorMessage.value = ''
  emit('close')
}

// 觸發檔案上傳
function triggerFileUpload() {
  fileInput.value?.click()
}

// 處理檔案上傳
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      errorMessage.value = '請上傳圖片檔案'
      return
    }
    
    // 檢查檔案大小 (限制 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = '圖片大小不能超過 5MB'
      return
    }
    
    // 讀取圖片預覽
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.imagePreview = e.target.result
      formData.value.imageFile = file
      errorMessage.value = ''
    }
    reader.readAsDataURL(file)
  }
}

// 移除圖片
function removeImage() {
  formData.value.imagePreview = null
  formData.value.imageFile = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 驗證表單
function validateForm() {
  // 檢查日期
  if (!formData.value.date) {
    errorMessage.value = '請選擇日期'
    return false
  }

  // 檢查是否有內容或圖片
  if (!formData.value.content && !formData.value.imagePreview) {
    errorMessage.value = '請輸入日記內容或上傳圖片'
    return false
  }

  errorMessage.value = ''
  return true
}

// 儲存日記
function saveDiary() {
  if (!validateForm()) {
    return
  }

  // 準備更新後的日記資料
  const updatedDiary = {
    id: formData.value.id,
    date: formData.value.date,
    title: formData.value.title || '每日日記',
    content: formData.value.content,
    image: formData.value.imagePreview,
    newImageFile: formData.value.imageFile,
    createdAt: props.diary.createdAt,
    updatedAt: new Date().toISOString()
  }

  emit('save', updatedDiary)
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
  flex-shrink: 0
}

.close-btn:hover {
background: rgba(255, 255, 255, 0.15);
  color: #333;
}

.close-btn:active {
  transform: scale(0.95);
}

.modal-title {
  font-size: 22px;
  color: white;
  margin: 0;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

/* 內容區 */
.modal-body {
  padding: 20px;
  padding-top:15px;
  overflow-y: auto;
  flex: 1;
}

/* 表單樣式 */
.form-group {
  margin-bottom: 20px;
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

.form-input ,
.form-textarea{
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #5eb3e4;
  box-shadow: 0 0 0 2px rgba(94, 179, 228, 0.2);
}

.form-textarea {
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

/* 現有圖片預覽 */
.current-image {
  margin-bottom: 5px;
}

.image-preview-box {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  display: inline-block;
  width: 100%;
  height: auto;
  max-height: 400px;
  display: block;

}

.image-preview-box img {
  display: block;
  width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-image-btn:hover {
  background: rgba(255, 71, 87, 0.9);
  transform: scale(1.1);
}

.image-hint {
  font-size: 14px;
  color: #999;
  margin: 8px 0 0 0;
  text-align: center;
  margin-top:20px;
}

/* 上傳區域 */
.upload-section {
  margin-top: 10px;
  text-align: center;
  width: 100%;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  color: #666;
  transition: all 0.3s;
}

.upload-btn:hover {
  border-color: #5eb3e4;
  background: #f0f8ff;
  color: #5eb3e4;
}

.upload-icon {
  font-size: 20px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin: 8px 0 0 0;
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
}

.btn-save:hover {
  background: #4a9fd4;
}

.btn-save:hover:not(:disabled) {
  background: #4a9fd4;
  box-shadow: 0 4px 8px rgba(94, 179, 228, 0.4);
}

.btn-save:disabled {
  background: #bab9b9;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 等待上傳動畫 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner::before {
  content: " ";
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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

/* iPhne 12 Pro  */
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
    padding: 16px;
  }

  .modal-title {
    font-size: 130%; 
  }

  .modal-body {
    padding: 20px;
  }
   .form-label {
    font-size: 16px;
  }
  
  .form-input,
  .form-textarea {
    padding: 8px 10px;
    font-size: 14px;
  }
  
  .form-group {
    margin-bottom: 10px; 
  }

  .image-preview-box img {
    max-height: 100%;
  }

  .remove-image-btn {
    width: 30px;
    height: 30px;
    top: 10px;
    right: 10px;
    font-size: 16px;
  }
  .upload-btn {
    padding: 15px 15px;
    font-size: 18px;
  }
  .upload-icon{
    font-size: 20px;
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

/* iPhne 14 Pro Max */
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

  .modal-body {
    padding: 20px;
  }
  .form-label {
    font-size: 18px;
  }
  
  .form-input,
  .form-textarea {
    padding: 8px 10px;
    font-size: 16px;
  }
  
  .form-group {
    margin-bottom: 10px; 
  }

  .image-preview-box img {
    max-height: 100%;
  }

  .remove-image-btn {
    width: 30px;
    height: 30px;
    top: 10px;
    right: 10px;
    font-size: 16px;
  }
  .upload-btn {
    padding: 15px 15px;
  }
  .upload-icon{
    font-size: 20px;
  }
  .modal-footer {
    flex-direction: column;
    gap: 8px; 
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
    font-size: 150%; 
  }

  .modal-body {
    padding: 22px;
  }
  .form-label {
    font-size: 22px;
  }
  
  .form-input,
  .form-textarea {
    padding: 8px 10px;
    font-size: 20px;
  }
  
  .form-group {
    margin-bottom: 10px; 
  }

  .image-preview-box img {
    max-height: 100%;
  }

  .remove-image-btn {
    width: 45px;
    height: 45px;
    top: 10px;
    right: 10px;
    font-size: 16px;
  }
  .upload-btn {
    padding: 20px 20px;
  }
  .upload-icon{
    font-size: 22px;
  }
  .modal-footer {
    flex-direction: column;
    gap: 8px; 
    padding: 10px 15px;
  }
  .image-hint,
  .upload-hint{
    font-size: 18px;
    margin: 10px;
  }
  .btn-cancel,
  .btn-save {
    padding: 15px;
    font-size: 20px;
  }
}
</style>