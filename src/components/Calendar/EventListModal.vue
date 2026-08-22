<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>{{ date }}</h3>

      <div class="event-list">
        <div
          v-for="event in events"
          :key="event.id"
          class="event-item"
          :class="`event-${event.type}`"
          @click="handleClick(event)"
        >
          {{ event.title }}
        </div>
      </div>

      <button class="close-btn" @click="$emit('close')">關閉</button>
    </div>
  </div>
</template>

<!-- <script setup>
defineProps({
  events: {
    type: Array,
    default: () => []
  },
  date: {
    type: String,
    required: true
  }
})

defineEmits(['close', 'eventClick'])
</script> -->

<script setup>
const props = defineProps({
  date: String,
  events: Array
})

const emit = defineEmits(['close', 'eventClick'])

function handleClick(event) {
  emit('eventClick', event) 
}
</script>


<style scoped>
/* 彈窗遮罩 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5); /* 稍微加深遮罩感 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

/* 彈窗主體 */
.modal {
  background: white;
  width: 90%;
  max-width: 350px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal h3 {
  margin-top: 0;
  font-size: 120%;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #a9a9a9;
  padding-bottom: 10px;
}

/* 基礎事件樣式 */
.event-item {
  padding: 10px 14px;
  border-radius: 8px;
  color: white; 
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.1s, opacity 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-item:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

/* 事件列表區域 */
.event-list {
  display: flex;
  flex-direction: column; 
  gap: 8px;              
  max-height: 205px;      
  overflow-y: auto;       
  overflow-x: hidden;     
  padding: 5x;          
}

.event-item {
  min-height: 25px;       
  padding: 10px 14px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;    
  flex-shrink: 0;        
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.event-list::-webkit-scrollbar {
  width: 4px;
}
.event-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

/* --- 顏色分類設定 --- */
/* 產檢：粉色 */
.event-checkup {
  background-color: #ff6b9d;
}

/* 預約：紫色 */
.event-appointment {
  background-color: #9c8ec9;
}

/* 其他：藍色 */
.event-other {
  background-color: #4fc3f7;
}

/* 提醒：黃色 */
.event-reminder {
  background-color: #ffa726;
  color: #fff; /* 若黃色太淺，可改為 #333 */
}

/* 日記：綠色 */
.event-diary {
  background-color: #4e7d50;
}

/* 關閉按鈕 */
.close-btn {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  border: none;
  background: #d1cfcf;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e0e0e0;
}

/* --- 響應式設定 --- */

/* iPhone 12 Pro  */
@media (max-width: 395px) {
  .modal {
    width: 85%;
    padding: 18px;
  }
  .event-item {
    padding: 10px 12px;
    font-size: 13px; 
    min-height: 28px;
  }
  .event-list {
    max-height: 200px; 
    gap: 8px;
  }
  .close-btn {
    padding: 10px 12px;
    font-size: 13px; 
    min-height: 28px;
  }
}

/* iPhone 14 Pro Max  */
@media (min-width: 396px) and (max-width: 450px) {
  .modal {
    width: 88%;
    max-width: 360px;
  }
  .event-item {
    padding: 12px 14px;
    font-size: 14px;
  }
  .event-list {
    max-height: 220px; 
  }
  .close-btn {
    padding: 12px 14px;
    font-size: 14px;
  }
}

/* iPad Air  */
@media (min-width: 768px) and (max-width: 1024px) {
  .modal {
    max-width: 500px;
    padding: 30px;
  }
  .modal h3 {
    font-size: 33px;
  }
  .event-item {
    padding: 15px 20px;
    font-size: 22px;
  }
  .event-list {
    max-height: 350px; 
    gap: 12px;
  }
  .close-btn {
    padding: 15px 20px;
    font-size: 22px;
  }
}
</style>
