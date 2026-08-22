eventdatailmodel
<template>
  <!-- 遮罩層 -->
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <!-- 彈窗內容 -->
      <div class="modal-container" @click.stop>
        <!-- 標題列 -->
        <div class="modal-header">
          <h3 class="modal-title">行程詳細資訊</h3>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>

        <!-- 內容 -->
        <div class="modal-body">
          <!-- 標題 -->
          <div class="event-title">
            <h1>{{ event.title }}</h1>
            <span class="event-type-badge" :class="`type-${event.type}`">
              {{ getEventTypeText(event.type) }}
            </span>
          </div>

          <!-- 詳細資訊 -->
          <div class="event-details">
            <!-- 日期時間 -->
            <div class="detail-item">
              <div class="detail-label">📅日期</div>
              <div class="detail-content">
                <div class="date-info">
                  <template v-if="!isMultiDay">
                    <span class="date-text">{{ formatDate(event.startDate) }}</span>
                  </template>
                  
                  <template v-else>
                    <span class="date-text">{{ formatDate(event.startDate) }}</span>
                    <span class="separator">－</span>
                    <span class="date-text">{{ formatDate(event.endDate) }}</span>
                  </template>
                </div>
              </div>
            </div>

            <!-- 地點 -->
            <div class="detail-item" v-if="event.location">
              <div class="detail-label">📍地點</div>
              <div class="detail-content">
                <div class="location-info">
                  <span>{{ event.location }}</span>
                </div>
              </div>
            </div>

            <!-- 時間軸 -->
            <div class="detail-item">
              <div class="detail-label">🕛行程安排</div>
              <div class="detail-content">
                <div class="unified-timeline">
                  <div v-for="(node, index) in timelineNodes" :key="index" class="timeline-node-item">
                    <div class="node-indicator">
                      <div class="node-dot" :class="[`type-${event.type}`, { 'is-end': index === timelineNodes.length - 1 }]"></div>
                      <div v-if="index !== timelineNodes.length - 1" class="node-line"></div>
                    </div>
                    
                    <div class="node-info-card">
                      <div class="node-time">{{ node.time }}</div>
                      <div class="node-desc">{{ node.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          
            <!-- 備註 -->
            <div class="detail-item" v-if="event.description">
              <div class="detail-label">📑備註</div>
              <div class="detail-content">
                <p class="description-text">{{ event.description }}</p>
              </div>
            </div>

            <!-- 地圖 -->
            <div class="detail-item" v-if="event.location">
              <div class="detail-label">🗺️位置</div>
              <div class="detail-content">
                <div ref="mapContainer" class="map-container"></div>
              </div>
            </div>
            <div class="meta">
            <!-- 有更新時間時才顯示 -->
            <div v-if="event.updatedAt" class="meta-item">
              <span class="meta-label">最後編輯：</span>
              <span class="meta-value">{{ formatDateTime(event.updatedAt) }}</span>
            </div>
          </div>  
        </div>
        </div>

        <!-- 底部按鈕 -->
        <div class="modal-footer">
          <button class="btn-delete" @click="deleteEvent">刪除行程</button>
          <button class="btn-edit" @click="editEvent">編輯</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import dayjs from 'dayjs'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  event: {
    type: Object,
    default: () => ({
      id: '',
      title: '',
      type: '',
      startDate: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      createdAt: '', 
      updatedAt: ''  
    })
  }
})

// Emits
const emit = defineEmits(['close', 'delete', 'edit'])

// 響應式數據
const activeTab = ref('view')

// 解析時間字串 (如 "10:00" -> 10)
function parseTime(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10);
}

// 解析時間字串的分鐘部分 (如 "10:30" -> 30)
function parseMinute(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[1], 10);
}

// 格式化小時標籤
function formatHourLabel(hour) {
  if (hour === 0) return '午夜12時'
  if (hour === 12) return '中午12時'
  if (hour < 12) return `上午${hour}時`
  return `下午${hour - 12}時`
}

// 格式化時間顯示（加上上午/下午）
function formatTimeDisplay(timeStr) {
  if (!timeStr) return ''
  
  const hour = parseTime(timeStr)
  const parts = timeStr.split(':')
  const minute = parts[1] || '00'
  
  if (hour === 0) return `午夜12:${minute}`
  if (hour === 12) return `中午12:${minute}`
  if (hour < 12) return `上午${hour}:${minute}`
  return `下午${hour - 12}:${minute}`
}

// 時間軸
const timelineNodes = computed(() => {
  if (!props.event.startTime || !props.event.endTime) return [];

  if (!isMultiDay.value) {
    // 單日行程
    const dayLabel = dayjs(props.event.startDate).format('MM/DD (ddd)');
    return [
      { 
        time: formatTimeDisplay(props.event.startTime), 
        description: `行程 ${dayLabel} 開始`,
        isPoint: true 
      },
      { 
        time: formatTimeDisplay(props.event.endTime), 
        description: `預計 ${dayLabel} 結束`,
        isPoint: true 
      }
    ];
  } else {
    // 跨日行程
    return multiDayList.value.map((day, index) => ({
      time: index === 0 ? props.event.startTime : (index === multiDayList.value.length - 1 ? props.event.endTime : '整天'),
      description: day.dateDisplay,
      isPoint: true
    }));
  }
});

// 判斷是否為跨日行程
const isMultiDay = computed(() => {
  if (!props.event.startDate || !props.event.endDate) return false;
  return props.event.startDate !== props.event.endDate;
});

// 生成跨日列表
const multiDayList = computed(() => {
  if (!isMultiDay.value) return [];
  
  const start = dayjs(props.event.startDate);
  const end = dayjs(props.event.endDate);
  const diffDays = end.diff(start, 'day');
  
  const days = [];
  for (let i = 0; i <= diffDays; i++) {
    const currentDay = start.add(i, 'day');
    days.push({
      dateDisplay: currentDay.format('MM/DD (ddd)'), 
      isToday: currentDay.isSame(dayjs(), 'day')
    });
  }
  return days;
});

// 關閉彈窗
function closeModal() {
  emit('close')
}

// 刪除行程
function deleteEvent() {
  if (confirm('確定要刪除此行程嗎？')) {
    emit('delete', props.event.id)
  }
}

// 編輯行程
function editEvent() {
  closeModal()
  emit('edit', props.event)
}

// 格式化日期
function formatDate(date) {
  if (!date) return ''
  return dayjs(date).format('YYYY 年 M 月 D 日')
}

// 格式化日期時間
function formatDateTime(date) {
  if (!date) return '尚無編輯紀錄'
  const formatted = dayjs(date).format('YYYY/MM/DD')
  return formatted === 'Invalid Date' ? '時間格式錯誤' : formatted
}

// 取得事件類型文字
function getEventTypeText(type) {
  const typeMap = {
    'checkup': '產檢',
    'appointment': '預約',
    'reminder': '提醒',
  }
  return typeMap[type] || '其他'
}

// 地圖
const mapContainer = ref(null)
let map = null
let marker = null
function initMap(location) {
  if (!mapContainer.value || !location || !window.google) return
  // modal 關閉前如果有 map，先清理
  if (map) {
    marker?.setMap(null)
    map = null
    marker = null
  }
  map = new google.maps.Map(mapContainer.value, {
    center: { lat: 0, lng: 0 },
    zoom: 15
  })
  const geocoder = new google.maps.Geocoder()
  geocoder.geocode({ address: location }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const pos = results[0].geometry.location
      map.setCenter(pos)
      marker = new google.maps.Marker({
        map,
        position: pos
      })
    } else {
      console.warn('無法取得地點經緯度', status)
    }
  })
}

// 監控 modal 是否顯示
watch(() => props.show, (isShown) => {
  if (isShown && props.event.location) {
    nextTick(() => initMap(props.event.location))
  } else {
    // modal 關閉時清理 map
    if (map) {
      marker?.setMap(null)
      map = null
      marker = null
    }
  }
})
// 當地點改變時重新載入地圖
watch(() => props.event.location, (newLoc) => {
  if (props.show && newLoc) nextTick(() => initMap(newLoc))
})
// 清理 map
onUnmounted(() => {
  if (map) {
    marker?.setMap(null)
    map = null
    marker = null
  }
})
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

.modal-title {
  font-size: 120%;
  color: white;
  margin: 0;
  font-weight: 600;
  flex-grow: 1;
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
  flex-shrink: 0
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
  padding: 20px;
  padding-top:10px;
  overflow-y: auto;
  flex: 1;
}

/* 標題區 */
.event-title {
  display: flex;
  align-items: center;
}

.event-title h1 {
  font-size: 24px;
  color: #333;
  margin: 10px 0;
  flex: 1;
  text-align: left;
}

.event-type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
}

.type-checkup{
  background: #ff6b9d;
}

.type-appointment {
  background: #9c8ec9;
}

.type-other {
  background: #4fc3f7;
}

.type-reminder {
  background: #ffa726;
}

/* 詳細資訊項目 */
.detail-item {
  margin-bottom: 20px;
}

.detail-label {
  font-size: 17px;
  color: #4d4c4c;
  font-weight: 600;
  text-align: left;
}

.detail-content {
  font-size: 15px;
  color: #333;
}

/* 日期 */
.date-info {
  display: flex;
  justify-content: center;
  text-align: center;
  gap: 8px;
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.separator {
  color: #999;
  font-size: 14px;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 地點 */
.location-info {
  display: flex;
  justify-content: center;
  text-align: center;
  gap: 8px;
  font-size: 16px;
}

/* 時間軸  */
.unified-timeline {
  padding: 15px 15px;
}

.timeline-node-item {
  display: flex;
  gap: 20px;
  position: relative;
}

.node-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
}

.node-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ccc; 
  z-index: 2;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-top: 20px;
  margin-bottom: 15px;
}

.node-dot.type-checkup { background-color: #ff6b9d; }
.node-dot.type-other { background-color: #4fc3f7; }
.node-dot.type-appointment{background-color: #9c8ec9;}
.node-dot.type-reminder{background-color: #ffa726;}

/* 終點節點 */
.node-dot.is-end {
  background-color: white !important;
  border: 3px solid;
}
.node-dot.is-end.type-checkup { border-color: #ff6b9d; }
.node-dot.is-end.type-other { border-color: #4fc3f7; }
.node-dot.is-end.type-appointment { border-color: #9c8ec9; }
.node-dot.is-end.type-reminder { border-color: #ffa726; }

.node-line {
  width: 3px;
  flex-grow: 1;
  background: #f0f0f0;
  min-height: 40px; 
}

.node-info-card {
  flex: 1;
  background: #fdfdfd;
  border: 1px solid #f0f0f0;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.node-time {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.node-desc {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

/* 地圖 */
.map-placeholder {
  background: #f0f0f0;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: #999;
}

.map-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.map-placeholder p {
  margin: 0;
  font-size: 14px;
}

.map-container {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}

/* 備註 */
.description-text {
  line-height: 1.6;
  color: #666;
  margin: 0;
  display: flex;
  justify-content: center;
  text-align: center;
}

/* 元資料 */
.event-meta {
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  font-size: 15px;
  margin-bottom: 5px;
  justify-content: center;
  text-align: center;
}

.meta-item {
  margin-bottom: 15px;
  justify-content: center;
  text-align: center;
  font-size: 15px
}

.meta-label  {
  color: #999;
}

.meta-value {
  color: #666;
  font-weight: 500;
  margin-right: 5px;
}

/* 底部按鈕 */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.btn-delete,
.btn-edit {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete {
  background: white;
  color: #ff4757;
  border: 1px solid #ff4757;
}

.btn-delete:hover {
  background: #ff4757;
  color: white;
}

.btn-edit {
  background: #5eb3e4;
  color: white;
}

.btn-edit:hover {
  background: #4a9fd4;
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
    padding: 18px;
  }

  .modal-title {
    font-size: 110%; 
  }
  
  .event-title h1 {
    font-size: 22px; 
     
  }
  
  .event-type-badge {
    font-size: 13px; 
  }

  .detail-item {
    margin-bottom: 20px;
  }
  
  .detail-label {
    font-size: 16px;
  }
  
  .detail-content,
  .description-text {
    font-size: 16px;
  }


  .timeline-row {
    grid-template-columns: 60px 1fr;
    gap: 10px;
  }
  
  .time-label {
    font-size: 12px;
  }

  .map-container {
    height: 220px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px; 
  }
  
  .btn-delete,
  .btn-edit {
    font-size: 16px;
    justify-content: center;
    text-align: center;
  }
  .event-block-container{
    left: 80px;
    width: 270px;
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
    padding: 22px;
  }

  .modal-title {
    font-size: 130%; 
  }
  
  .event-title h1 {
    font-size: 25px; 
     
  }
  
  .event-type-badge {
    font-size: 15px; 
  }

  .detail-item {
    margin-bottom: 20px;
  }
  
  .detail-label {
    font-size: 18px;
  }
  
  .detail-content,
  .description-text {
    font-size: 17px;
  }


  .timeline-row {
    grid-template-columns: 60px 1fr;
    gap: 10px;
  }
  
  .time-label {
    font-size: 12px;
  }

  .map-container {
    height: 220px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px; 
  }
  
  .btn-delete,
  .btn-edit {
    font-size: 16px;
    justify-content: center;
    text-align: center;
  }
  .event-block-container{
    left: 80px;
    width: 300px;
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
  
  .event-title h1 {
    font-size: 27px; 
     
  }
  
  .event-type-badge {
    font-size: 17px; 
  }

  .detail-item {
    margin-bottom: 20px;
  }
  
  .detail-label {
    font-size: 22px;
  }
  
  .detail-content,
  .description-text,
  .location-info span {
    font-size: 20px;
  }


  .timeline-row {
    grid-template-columns: 60px 1fr;
    gap: 10px;
  }
  
  .time-label {
    font-size: 15px;
  }

  .map-container {
    height: 250px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px; 
  }
  
  .btn-delete,
  .btn-edit {
    font-size: 20px;
    justify-content: center;
    text-align: center;
  }
  .event-block-container{
    left: 80px;
    width: 500px;
  }
}
</style>