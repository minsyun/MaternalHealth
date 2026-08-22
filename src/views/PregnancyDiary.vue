
<template>
  <div class="calendar-dashboard">
    <div class="content-wrapper">
      <!-- 行事曆區域 -->
      <div class="calendar-section">
        <EventCalendar 
          :events="combinedCalendarData"
          @dayClick="handleDayClick"
          @monthChange="handleMonthChange"
          @eventClick="handleEventClick"
          @addEvent="handleAddEvent"
        />
      </div>
      
      <!-- 新增日記區域 -->
      <div class="diary-section">
        <div class="diary-form">
          <h3>新增日記</h3>
          <div class="form-group">
            <label>日期：</label>
            <select v-model="newDiary.date" class="date-select">
              <option value="" disabled>請選擇日期或點擊日曆選擇日期</option>
              <option
                v-for="day in dateOptions"
                :key="day.value"
                :value="day.value"
              >
                {{ day.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <textarea
              v-model="newDiary.title"
              placeholder="幫今天取個小標題吧～"
            ></textarea>
          </div>
          
          <div class="form-group">
            <textarea 
              v-model="newDiary.content"
              placeholder="今天發生了什麼事呢？寫下來吧！"
              rows="8"
            ></textarea>
          </div>
          
          <div class="form-group">
            <div class="image-upload" @click="triggerFileUpload">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                style="display: none"
              />
              <div class="upload-placeholder" v-if="!newDiary.imagePreview">
                <span>📷</span>
                <p>快來丟張照片，讓日記更精彩！</p>
              </div>
              <div class="image-preview" v-else>
                <img :src="newDiary.imagePreview" alt="預覽圖片" />
                <button class="remove-image" @click.stop="removeImage">✕</button>
              </div>
            </div>
            <p class="upload-hint">支援 JPG、PNG 格式，檔案大小不超過 5MB</p>
          </div>
          
          <div class="form-actions">
            <button 
              class="btn-cancel" 
              @click="resetDiaryForm" 
              :disabled="isSubmitting"
            >
              清除
            </button>
            <button 
              class="btn-save" 
              @click="saveDiary" 
              :disabled="!newDiary.date || isSubmitting"
            >
              <span v-if="isSubmitting" class="loading-spinner">
                日記上傳中，請稍候～
              </span>
              <span v-else>儲存</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 行程詳細資訊彈窗 -->
    <EventDetailModal
      :show="showEventDetail"
      :event="selectedEvent"
      @close="closeEventDetail"
      @delete="handleDeleteEvent"
      @edit="handleEditEvent"
    />

    <!-- 編輯行程表單 -->
    <EventEditForm
      :show="showEditForm"
      :event="selectedEvent"
      @close="showEditForm = false"
      @save="handleSaveEvent"
    />

    <!-- 新增行程表單 -->
    <EventAddForm
      :show="showAddForm"
      :defaultDate="defaultAddDate"
      @close="showAddForm = false"
      @save="handleAddNewEvent"
    />

    <!-- 日記詳細資訊彈窗 -->
    <DiaryDetailModal
      :show="showDiaryDetail"
      :diary="selectedDiary"
      @close="showDiaryDetail = false"
      @delete="handleDeleteDiary"
      @edit="handleEditDiary"
      @save="handleSaveDiary"
    />

    <!-- 編輯日記表單 -->
    <DiaryEditForm
      :show="showDiaryEdit"
      :diary="selectedDiary"
      :isUpdatingDiary="isUpdatingDiary"
      @close="showDiaryEdit = false"
      @save="handleSaveDiary"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import EventCalendar from '../components/Calendar/EventCalendar.vue'
import EventDetailModal from '../components/Calendar/EventDetailModal.vue'
import EventEditForm from '../components/Calendar/EventEditForm.vue'
import EventAddForm from '../components/Calendar/EventAddForm.vue'  
import DiaryDetailModal from '../components/Calendar/DiaryDetailModal.vue'
import DiaryEditForm from '../components/Calendar/DiaryEditForm.vue'
import dayjs from 'dayjs'

import { useCalendarStore } from '../stores/calendarStore.js'

// 新增路由實例
const route = useRoute()
const calendarStore = useCalendarStore()

const getLoggedInUserId = () => {
  const userJson = sessionStorage.getItem("user");
  if (userJson) {
    const user = JSON.parse(userJson);
    return user.user_id; // 確保與你 Login.vue 存入的 key 一致
  }
  return null;
};
const currentUserId = getLoggedInUserId();

// 彈窗狀態
const showEventDetail = ref(false)
const showEditForm = ref(false)
const showAddForm = ref(false)
const showDiaryDetail = ref(false)
const showDiaryEdit = ref(false)
const defaultAddDate = ref("")

const selectedDiary = ref({})
const selectedEvent = ref({})

// 等待日記儲存狀態
const isSubmitting = ref(false)

// 等待日記更新狀態
const isUpdatingDiary = ref(false)

// 新增日記表單
const newDiary = ref({
  date: '',
  title: '',
  content: '',
  imagePreview: null,
  imageFile: null
})

// 合併事件和日記（用於顯示在日曆上）
const combinedCalendarData = computed(() => {
  const ev = calendarStore.events || [];
  const di = calendarStore.diaries || [];

  // 取得今天的日期字串 (YYYY-MM-DD)
  const today = dayjs().format('YYYY-MM-DD');

  // 過濾日記：只有日期小於或等於今天的才會被放入
  const filteredDiaries = di.filter(d => {
    return d.date <= today;
  });
  
  return [
    ...ev.map(e => ({ ...e, isDiary: false })),
    ...filteredDiaries.map(d => ({ 
      ...d, 
      isDiary: true, 
      title: `${d.title}`, 
      type: 'diary' 
    }))
  ];
});

onMounted(async () => {
  if (!currentUserId) {
    alert("登入逾時或尚未登入，請重新登入");
    route.push("/"); // 導回登入頁
    return;
  }

  const localEvents = sessionStorage.getItem(`events_${currentUserId}`);
  const localDiaries = sessionStorage.getItem(`diaries_${currentUserId}`);

  if (localEvents && localDiaries) {
    // 同步到 store 的 state
    calendarStore.events = JSON.parse(localEvents);
    calendarStore.diaries = JSON.parse(localDiaries);
    console.log("已從快取載入行程與日記");
  } else {
    // 若無快取，則發送 API 請求
    await calendarStore.fetchAllData(currentUserId);
  }

  if (route.query.date) {
    newDiary.value.date = route.query.date;
    currentMonth.value = dayjs(route.query.date);
  }
  // 從首頁點擊行程編輯跳轉至孕育時光表
  if (route.query.editEventId) {
    const eventToEdit = calendarStore.events.find(e => e.id == route.query.editEventId);
    if (eventToEdit) {
      selectedEvent.value = { ...eventToEdit };
      showEditForm.value = true;
    }
  }
  // 從首頁點擊日記編輯跳轉至孕育時光表
  if (route.query.editDiaryId) {
    const diaryToEdit = calendarStore.diaries.find(d => d.id === route.query.editDiaryId);
    if (diaryToEdit) {
      console.log("偵測到日記編輯請求:", diaryToEdit);
      selectedDiary.value = { ...diaryToEdit };
      showDiaryEdit.value = true; // 開啟日記編輯彈窗
    }
  }
});

// 處理點擊日曆上的物件
function handleEventClick(item) {
  if (item.isDiary) {
    const fullDiary = calendarStore.diaries.find(d => d.id === item.id);
    selectedDiary.value = { ...fullDiary };
    showDiaryDetail.value = true;
  } else {
    selectedEvent.value = { ...item };
    showEventDetail.value = true;
  }
}

// 處理行程編輯事件
function handleEditEvent(event) {
    selectedEvent.value = { ...event }
    showEventDetail.value = false
    showEditForm.value = true
}

// 處理儲存編輯後的行程事件
async function handleSaveEvent(updatedEvent) {
    console.log('儲存編輯行程:', updatedEvent)
    // *** 呼叫 Store 的 Action ***
    await calendarStore.updateEvent(updatedEvent)
    alert('行程已更新！')

    showEditForm.value = false
}

// 處理新增行程按鈕點擊 
function handleAddEvent() {
    console.log('開啟新增行程表單')
    defaultAddDate.value = dayjs().format('YYYY-MM-DD')
    showAddForm.value = true
}

// 處理新增新行程
function handleAddNewEvent(newEvent) {
    console.log('新增行程:', newEvent)
    // *** 呼叫 Store 的 Action ***
    calendarStore.addEvent(newEvent)
    showAddForm.value = false
}

// 處理刪除事件 
function handleDeleteEvent(eventId) {
    console.log('刪除事件 ID:', eventId)
    calendarStore.deleteEvent(eventId)
    showEventDetail.value = false
    alert('行程已刪除')
}

// 關閉行程詳細資訊視窗
function closeEventDetail() {
  console.log('關閉彈窗')
  showEventDetail.value = false
}

// 檔案上傳參考
const fileInput = ref(null)

// 計算顯示的日期格式 (月/日)
const selectedDateDisplay = computed(() => {
  if (!newDiary.value.date) {
    return ''
  }
  const date = dayjs(newDiary.value.date)
  return date.format('MM/DD')
})

// 建立下拉選單日期（依目前月份）
const currentMonth = ref(dayjs())
const dateOptions = computed(() => {
  const daysInMonth = currentMonth.value.daysInMonth()
  const year = currentMonth.value.year()
  const month = currentMonth.value.month() + 1
  const today = dayjs(); // 取得現在時間

  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1
    const fullDate = dayjs(`${year}-${month}-${d}`).format('YYYY-MM-DD')
    const label = dayjs(fullDate).format('MM/DD')
    return {
      value: fullDate,
      label,
      // 增加一個屬性標記是否為未來
      isFuture: dayjs(fullDate).isAfter(today, 'day')
    }
  }).filter(option => !option.isFuture); // 直接過濾掉未來的日期選項
})

// 處理點擊日曆
function handleDayClick(day) {
  const today = dayjs().format('YYYY-MM-DD');
  if (day.fullDate > today) {
    alert('還不能寫未來的日記喔！');
    return;
  }
  console.log('選擇日期:', day)
  newDiary.value.date = day.fullDate
}

// 處理月份變更
function handleMonthChange({ year, month }) {
  currentMonth.value = dayjs(`${year}-${month}-01`)
}

// 觸發檔案上傳
function triggerFileUpload() {
  fileInput.value?.click()
}

// 處理檔案上傳
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // 檢查格式
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    alert('格式不符，僅支援 JPG 與 PNG 格式')
    event.target.value = '' // 清空 input
    return
  }
  
  // 檢查大小
  if (file.size > 5 * 1024 * 1024) {
    alert('圖片大小不能超過 5MB')
    event.target.value = '' // 清空 input
    return
  }
    
    // 讀取圖片預覽
    const reader = new FileReader()
    reader.onload = (e) => {
      newDiary.value.imagePreview = e.target.result
      newDiary.value.imageFile = file
    }
    reader.readAsDataURL(file)
  // }
}

// 移除圖片
function removeImage() {
  newDiary.value.imagePreview = null
  newDiary.value.imageFile = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 儲存日記
const saveDiary = async () => {
  // 欄位驗證
  if (!newDiary.value.date) {
    alert('請選擇日期')
    return
  }
  if (!newDiary.value.content && !newDiary.value.imageFile) {
    alert('請輸入內容或上傳圖片 (兩者至少擇一)')
    return
  }

  // 開始上傳日記
  isSubmitting.value = true

  // 建立日記資料物件
  try {
  // 呼叫 Store 的 Action
  await calendarStore.addDiary(newDiary.value, newDiary.value.imageFile);
  alert(`日記已儲存！`)
  // 重置日記表單
  resetDiaryForm()
  } catch (error) {
    console.error('儲存失敗:', error)
    alert('儲存失敗')
  }finally {
    // 無論成功或失敗都關閉載入狀態顯示
    isSubmitting.value = false 
  }
};



// 重置日記表單
function resetDiaryForm() {
  newDiary.value = {
    date: '',
    title: '',
    content: '',
    imagePreview: null,
    imageFile: null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 處理刪除日記
function handleDeleteDiary(diaryId) {
    console.log('刪除日記 ID:', diaryId)
    // *** 呼叫 Store 的 Action ***
    calendarStore.deleteDiary(diaryId)
    showDiaryDetail.value = false
    alert('日記已刪除')
}

// 處理編輯日記
function handleEditDiary(diary) {
  console.log('編輯日記:', diary)
  selectedDiary.value = { ...diary }
  showDiaryDetail.value = false
  showDiaryEdit.value = true
}

// 處理儲存編輯後的日記
async function handleSaveDiary(updatedDiary) {
    console.log('儲存編輯日記:', updatedDiary)
    const dataWithUser = { ...updatedDiary, user_id: currentUserId };

  try {
     // 開始更新日記
    isUpdatingDiary.value = true
    await calendarStore.updateDiary(dataWithUser, updatedDiary.newImageFile)

    alert('日記已更新！')
    showDiaryEdit.value = false

  } catch (err) {
    console.error('更新出錯:', err)
    alert('更新失敗')
  } finally {
    isUpdatingDiary.value = false
  }
}
</script>

<style scoped>
.calendar-dashboard{
  padding: 20px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.content-wrapper {
  display: flex;
  flex-wrap: nowrap;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  max-width: 1200px;
  width: 100%;
}

.calendar-section {
  flex:  0 0 65%;
  width: 100%;
  min-width: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  padding: 0;
}

.calendar-section > * {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 15px;
}

.diary-section {
  flex: 0 0 25%;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: white;
  border-radius: 8px;
  padding: 20px;
   min-width: 0;
}

.diary-section > * {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 15px;
}


.date-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  font-size: 14px;
  color: #666;
}

.diary-form h3 {
  color: #606365;
  margin-top: 18px;
  font-size: 24px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

.date-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #f9f9f9;
  cursor: default;
  color: #999;
}

.date-input::placeholder {
  color: #999;
}

.form-group textarea {
  width: 95%;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  padding: 10px;
  margin: 0;
}

.image-upload {
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.upload-placeholder {
  width: 100%;
  height: 150px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: #5eb3e4;
  background: #f0f8ff;
}

.upload-placeholder span {
  font-size: 48px;
  margin-bottom: 10px;
}

.upload-placeholder p {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.image-preview {
  width: 100%;
  height: 200px;
  position: relative;

}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.5);
  border: none;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
}


.remove-image:hover {
  background: rgba(165, 163, 163, 0.9);
  transform: scale(1.1);
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 8px 0 0 0;
  text-align: center;
}

/* 底部按鈕 */
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-save {
flex: 1;
background: #5eb3e4;
color: white;
border: none;
padding: 12px;
border-radius: 6px;
}
.btn-cancel {
flex: 1;
background: white;
border: 1px solid #ddd;
padding: 12px;
border-radius: 6px;
}
.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-save {
  background: #5eb3e4;
  color: white;
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

/* iPad Air*/
@media (max-width: 850px)  {
  .content-wrapper {
    flex-direction: column;
    flex-wrap: wrap;
  }

  .calendar-section {
    width: 100%;
    min-height: auto;
  }

  .calendar-section {
    order: 1; /* 行事曆上面 */
  }

  .diary-section {
    order: 2; /* 日記下面 */
    width: 95%;
  }
  .date-select{
    width: 100%;
    font-size: 18px;
  }
  .form-group textarea{
    width: 97%;
    font-size: 18px;
    padding-left: 15px;
    padding-top: 15px;
  }
  .upload-placeholder span{
    font-size: 35px;
  }
  .upload-placeholder p,
  .upload-hint{
    font-size: 20px;
  }
  .diary-form{
    padding: 15px;
  }
  .diary-form h3{
    font-size: 28px;
  }
  .btn-cancel,
  .btn-save{
    font-size: 18px;
  }
}


/* iPhone 14 Pro Max  iPhone 12 Pro */
@media  (max-width: 450px) {
  .calendar-section {
    width: 100%;
  }
  .diary-section{
    width: 89%;
  }
  .diary-form{
    padding: 5px;
  }
  .form-group textarea{
    width: 93%;
    font-size: 15px;
    padding-left: 10px;
    padding-top: 10px;
  }
  .date-select{
    width: 100%;
    font-size: 15px;
  }
  .upload-placeholder span{
    font-size: 25px;
  }
  .upload-placeholder p{
    font-size: 15px;
  }
  .upload-hint{
    font-size: 13px;
  }
  .diary-form{
    padding: 10px;
  }
  .diary-form h3{
    font-size: 22px;
  }
  .btn-cancel,
  .btn-save{
    font-size: 15px;
  }
}
</style>