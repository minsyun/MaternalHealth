<template>
  <div class="upload-container">
    <h2>上傳圖片到 Cloudinary</h2>

    <input 
      type="file" 
      accept="image/*" 
      @change="handleFileChange" 
      :disabled="isUploading"
    />

    <button 
      @click="uploadImage" 
      :disabled="!selectedFile || isUploading"
      class="upload-btn"
    >
      {{ isUploading ? '上傳中...' : '開始上傳' }}
    </button>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <div v-if="uploadedUrl" class="preview-area">
      <p>上傳成功！</p>
      <img :src="uploadedUrl" alt="Uploaded Image" />
      <p class="url-text">網址: {{ uploadedUrl }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- 設定區 ---
const CLOUD_NAME = 'drzkcuusl'; // 請替換成你的 Cloud Name
const UPLOAD_PRESET = 'lissa259'; // 請替換成你的 Unsigned Preset Name

// --- 狀態變數 ---
const selectedFile = ref(null);
const uploadedUrl = ref('');
const isUploading = ref(false);
const errorMsg = ref('');

// --- 處理檔案選擇 ---
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    errorMsg.value = ''; // 清除之前的錯誤
    uploadedUrl.value = ''; // 清除之前的預覽
  }
};

// --- 執行上傳 (核心邏輯) ---
const uploadImage = async () => {
  if (!selectedFile.value) return;

  isUploading.value = true;
  errorMsg.value = '';

  // 1. 準備 FormData
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    // 2. 發送 POST 請求給 Cloudinary
    // 雖然 Vue 常用 axios，但這裡用原生的 fetch 就不需安裝額外套件
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || '上傳失敗');
    }

    // 3. 取得圖片網址
    uploadedUrl.value = data.secure_url;
    console.log('完整回應:', data); // 可以在 Console 看到更多圖片資訊 (寬高、格式等)

  } catch (error) {
    console.error('Upload Error:', error);
    errorMsg.value = `發生錯誤: ${error.message}`;
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
.upload-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}
.upload-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
.upload-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.preview-area img {
  max-width: 100%;
  margin-top: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.error {
  color: red;
  font-size: 0.9em;
}
.url-text {
  font-size: 0.8em;
  color: #666;
  word-break: break-all;
}
</style>