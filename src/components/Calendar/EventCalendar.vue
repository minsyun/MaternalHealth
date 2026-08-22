<template>
    <div class="calendar-container">
      <!-- 月份標題和導航 -->
      <div class="calendar-header">
        <!-- 年月（點擊打開選單） -->
        <h2 class="month-title" @click.stop="openMonthPicker">
          {{ currentYear }}年{{ currentMonth }}月
        </h2>

        <!-- 年月 選擇器 -->
        <div v-if="showMonthPicker" class="month-picker-popup">
          <div 
              v-if="showMonthPicker" 
              ref="pickerRef" 
              @click.stop
            >
            <div class="picker-title">選擇年月</div>
              <div class="picker-columns">
                <!-- 年份 -->
                <div class="picker-column">
                  <div 
                    v-for="y in yearOptions" 
                    :key="y"
                    class="picker-item"
                    :class="{ active: y === tempYear }"
                    @click="tempYear = y"
                  >
                    {{ y }} 年
                  </div>
                </div>
                <!-- 月份 -->
                <div class="picker-column">
                  <div 
                    v-for="m in 12" 
                    :key="m"
                    class="picker-item"
                    :class="{ active: m === tempMonth }"
                    @click="tempMonth = m"
                  >
                    {{ m }} 月
                  </div>
                </div>
              </div>
              <div class="picker-actions">
                <button class="confirm-btn" @click="closeMonthPicker()">取消</button>
                <button class="confirm-btn" @click="applyMonth()">確認</button>
              </div>
          </div>
        </div>
      </div>

      <div class="calender-header-bar">
        <div class="header-left">
          <button class="nav-btn" @click="previousMonth">◀</button>
          <button class="today-btn" @click="goToday">Today</button>
          <button class="nav-btn" @click="nextMonth">▶</button>
        </div>
        <div class="header-right">
          <button class="add-event-btn" @click="openAddEvent">＋</button>
        </div>
      </div>

      <!-- 星期標題 -->
      <div class="weekdays">
        <div class="weekday">一</div>
        <div class="weekday">二</div>
        <div class="weekday">三</div>
        <div class="weekday">四</div>
        <div class="weekday">五</div>
        <div class="weekday">六</div>
        <div class="weekday">日</div>
      </div>

      <!-- 日期格子 -->
      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.fullDate"
          class="day-cell"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-event': day.events.length > 0
          }"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.date }}</div>

          <!-- 顯示事件 -->
          <div class="events">
            <div
              v-for="event in day.events.slice(0, 2)"
              :key="event.id"
              class="event-item"
              :class="[
                `event-${event.type}`,
                {
                  'is-multi-start': event.isMultiDay && event.isStart,
                  'is-multi-middle': event.isMultiDay && !event.isStart && !event.isEnd,
                  'is-multi-end': event.isMultiDay && event.isEnd
                }
              ]"
              @click.stop="handleEventClick(event)"
            >
            <span :style="{ visibility: (event.isMultiDay && !event.isStart) ? 'hidden' : 'visible' }">
                {{ event.title }}
            </span>
            </div>

            <div 
              v-if="day.events.length > 2" 
              class="more-events"
              @click.stop="showMoreEvents(day)"
            >
              +{{ day.events.length - 2 }} 更多
            </div>
          </div>
        </div>
      </div>

      <!-- 更多事件彈窗 -->
      <EventListModal
        v-if="showEventModal"
        :events="modalEvents"
        :date="modalDate"
        @close="showEventModal = false"
        @eventClick="handleEventClick"
      />
    </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import EventListModal from './EventListModal.vue'

dayjs.extend(isBetween)

const eventsMap = computed(() => {
  const map = {}

  props.events.forEach(event => {
    if (!map[event.date]) {
      map[event.date] = []
    }
    map[event.date].push(event)
  })

  return map
})

// Props
const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['dayClick', 'monthChange', 'eventClick'])

// 談窗狀態
const showEventModal = ref(false)
const modalEvents = ref([])
const modalDate = ref('')

// 響應式數據
const currentDate = ref(dayjs())
const selectedDate = ref(null)

function emitMonthChange() {
  emit('monthChange', {
    year: currentYear.value,
    month: currentMonth.value
  })
}

// 回到today
function goToday() {
  currentDate.value = dayjs()
  emitMonthChange()
}

// 年月選擇器
const showMonthPicker = ref(false)
const pickerRef = ref(null)
const tempYear = ref(dayjs().year())
const tempMonth = ref(dayjs().month() + 1)

const yearOptions = computed(() => {
  const years = []
  for (let y = 2000; y <= 2035; y++) years.push(y)
  return years
})

// 自動捲動到選中項
async function openMonthPicker() {
  tempYear.value = currentDate.value.year()
  tempMonth.value = currentDate.value.month() + 1
  showMonthPicker.value = true

  // 自動捲動到選中的年月
  await nextTick()
  if (pickerRef.value) {
    const activeItems = pickerRef.value.querySelectorAll('.picker-item.active')
    activeItems.forEach(item => {
      item.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }
}

function handleClickOutside(event) {
  if (event.target.classList.contains('month-title')) return;
  // 如果選單是打開的，且點擊的目標不在 pickerRef 內
  if (showMonthPicker.value && pickerRef.value && !pickerRef.value.contains(event.target)) {
    closeMonthPicker()
  }
}

function applyMonth() {
  currentDate.value = dayjs(`${tempYear.value}-${tempMonth.value}-01`)
  showMonthPicker.value = false

  emitMonthChange()
}
function closeMonthPicker() {
  tempYear.value = currentYear.value
  tempMonth.value = currentMonth.value
  showMonthPicker.value = false
}

// 計算屬性
const currentYear = computed(() => currentDate.value.year())
const currentMonth = computed(() => currentDate.value.month() + 1)


const isDateInRange = (dateStr, event) => {
  // 單日事件 
  if (!event.startDate && !event.endDate) {
    return event.date === dateStr
  }
  // 跨日事件
  const start = event.startDate || event.date
  const end = event.endDate || event.date
  return dayjs(dateStr).isBetween(start, end, 'day', '[]')
}

// 生成日曆天數
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  // 當月第一天和最後一天
  const firstDay = dayjs(`${year}-${month}-01`)
  const lastDay = firstDay.endOf('month')
  
  // 計算需要顯示的天數
  const startDay = firstDay.startOf('week').add(1, 'day') // 從週一開始
  const endDay = lastDay.endOf('week').add(1, 'day')

  const days = []
  let currentDay = startDay

  const sortedAllEvents = [...props.events].sort((a, b) => {
    const aStart = a.startDate || a.date
    const aEnd = a.endDate || a.date
    const bStart = b.startDate || b.date
    const bEnd = b.endDate || b.date
    const aLen = dayjs(aEnd).diff(dayjs(aStart), 'day')
    const bLen = dayjs(bEnd).diff(dayjs(bStart), 'day')
    return bLen - aLen || dayjs(aStart).diff(dayjs(bStart))
  })
  
  while (currentDay.isBefore(endDay) || currentDay.isSame(endDay, 'day')) {
    const dateStr = currentDay.format('YYYY-MM-DD')
    
    // 取得該日事件並處理跨日狀態
    const dayEvents = sortedAllEvents
      .filter(e => isDateInRange(dateStr, e))
      .map(event => {
        const start = event.startDate || event.date
        const end = event.endDate || event.date
        const isStart = start === dateStr
        const isEnd = end === dateStr
        const isMultiDay = start !== end

        return {
          ...event,
          isMultiDay,
          isStart,
          isEnd
        }
      })

    days.push({
      date: currentDay.date(),
      fullDate: dateStr,
      isCurrentMonth: currentDay.month() + 1 === month,
      isToday: currentDay.isSame(dayjs(), 'day'),
      events: dayEvents
    })
    currentDay = currentDay.add(1, 'day')
  }
  return days
})

// 獲取特定日期的事件
function getEventsForDay(date) {
  const dateStr = date.format('YYYY-MM-DD')
  return eventsMap.value[dateStr] || []
}

// 上個月
function previousMonth() {
  currentDate.value = currentDate.value.subtract(1, 'month')
  emitMonthChange()
}

// 下個月
function nextMonth() {
  currentDate.value = currentDate.value.add(1, 'month')
  emitMonthChange()
}

// 選擇日期
function selectDay(day) {
  if (day.isCurrentMonth) {
    selectedDate.value = day.fullDate
    emit('dayClick', day)
  }
}

// 處理事件點擊
function handleEventClick(event) {
  showEventModal.value = false
  emit('eventClick', event)
}

// 顯示更多事件
function showMoreEvents(day) {
  // 可以顯示該日所有事件的列表
  console.log('顯示更多事件:', day.events)
  modalEvents.value = day.events
  modalDate.value = day.fullDate
  showEventModal.value = true
}

// 開啟新增行程
function openAddEvent() {
  emit('addEvent')
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
:root {
  --primary-blue: #5eb3e4;
  --secondary-blue: #0557e5;
  --bg-gray: #f5f5f5;
  --border-color: #e0e0e0;
  --text-main: #333;
  --text-muted: #666;
}

.calendar-container {
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 800px; 
  padding-bottom: 15px;
  overflow: hidden;
  
} 

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.month-title {
  flex-grow: 1;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #606365;
  cursor: pointer;
  user-select: none;
  margin-bottom: 5px;
}

.month-title:hover {
  color: var(--primary-blue);
}

.calender-header-bar{
  display: flex;
  align-items: center; 
  justify-content: space-between;
  padding: 10px;
}

.header-left {
  display: flex; 
  align-items: center; 
}

.nav-btn, 
.today-btn {
  border: 1px solid #ccc;
  padding: 8px 14px;
  cursor: pointer;
  background-color: white;
  color:#0557e5;
  font-size: 16px;
  border-radius: 4px;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s; 
}

.nav-btn:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.nav-btn:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.nav-btn:hover, .today-btn:hover {
  background-color: #f0f0f0;
}

.today-btn {
  margin: 0 8px; 
}

.today-btn:hover {
  background: #b1afaf;
  transform: scale(1.05);
}

.today-btn:active {
  transform: scale(0.95);
}

.header-right{
  display: flex; 
  align-items: center;
}

.add-event-btn {
  border: 1px solid #ccc;
  padding: 0px 8px;
  border-radius: 4px;
  cursor: pointer;
  background-color: white;
  color:#0557e5;
  font-size: 28px;
  font-weight: bold;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s; 
}

.add-event-btn:hover {
  background-color: #f0f0f0;
}

.add-event-btn:active {
  transform: scale(0.95);
}

.month-picker-popup {
  position: absolute;
  top: 100%; 
  left: 50%;
  transform: translateX(-50%);
  background: white;
  width: 90%;
  max-width: 300px;
  padding: 14px;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.2);
  z-index: 9999;
}

.picker-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.picker-columns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.picker-column {
  width: 120px;
  height: 160px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 6px 0;
}

.picker-item {
  padding: 8px;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
  color: #555;
}

.picker-item:hover {
  background: #e6f4ff;
}

.picker-item.active {
  background: #5eb3e4;
  color: white;
  font-weight: bold;
  border-radius: 6px;
}

.picker-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 30px;
}

.confirm-btn {
  padding: 8px 18px;
  background: #5eb3e4;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 1px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  box-shadow: none; 
  padding: 0 15px;
  color: var(--text-muted);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  box-shadow: none; 
  padding: 0 15px;
}

.weekday {
  background: #f5f5f5;
  padding: 12px 0;
  text-align: center;
  font-weight: 600;
  color: #666;
  font-size: 14px;
  max-width: 100%;
}

/* 確保左右兩側邊緣的格子貼合容器邊緣 */
.day-cell {
  background: white;
  min-height: 100px;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
  overflow: hidden; 
  position: relative;
  border-right: none;
  transition: background 0.2s;
}

.day-cell:nth-child(7n) { 
  border-right: none; 
}

.day-cell:hover {
  background: #fcfcfc;
}

.day-cell.other-month {
  background: #f5f5f5; 
  color: #d0d0d0;
}

.day-cell.today {
  background: #f0f7ff;
}

.day-cell.today .day-number {
  background: #5eb3e4;
  color: white;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
  flex-shrink: 0; 
  margin-top: 4px;
  padding: 2px 2px; 
  z-index: 5;
}

.events {
  padding: 0 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-item {
  font-size: 13px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  cursor: pointer;
  box-sizing: border-box;      
  height: 22px;
  line-height: 18px;
  padding: 2px 6px;
  position: relative;
  margin-right: 0;
  margin-left: 0;
  width: 100%;
}

/* 開始天 */
.is-multi-start {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  width: 105%;
  z-index: 3;

}

/* 中間天 */
.is-multi-middle {
  border-radius: 0;
  margin-left: -5%;
  width: 110%;
  z-index: 3;
}

/* 結束天 */
.is-multi-end {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  margin-left: -5%;
  width: 105%;
  z-index: 3;
}

.event-item:hover {
  opacity: 0.8;
}

/* 產檢 */
.event-checkup {
  background-color: #ff6b9d !important;
  color: white !important;
}

/* 其他 */
.event-other {
  background-color: #4fc3f7 !important;
  color: white !important;
}

/* 日記 */
.event-diary {
  background-color: #4e7d50 !important;
  color: white !important;
}

/* 預約*/
.event-appointment {
  background-color: #9c8ec9 !important;
  color: white !important;
}

/* 提醒*/
.event-reminder {
  background-color: #ffa726 !important;
  color: white !important;
}

.more-events {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  cursor: pointer;
  text-decoration: underline;
}

.more-events:hover {
  color: #5eb3e4;
}

/* 簡單淡入動畫 */
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 5px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

/* iPhone 12 Pro   */
@media (min-width: 350px) and (max-width: 400px) {
  .calendar-container {
    min-width: 100%;
    overflow: hidden; 
  }
  .day-cell {
    min-height: 60px;
    border-right: none;
    overflow: visible;
    max-width:40px;
  }
  .day-number{
    font-size: 12px;
  }
  .day-cell.today .day-number {
    width: 20px;
    height: 20px;
    margin-bottom: 5px;
  }

  .event-item {
    font-size: 10px;
    padding: 2px 2px;
    margin-top: 2px;
  }
  .events {
    margin-top: 2px;
  }
  
  .more-events {
    font-size: 11px;
  }
  .month-title{
    font-size: 25px;
  }
  .is-multi-start {
    border-radius: 4px 0 0 4px;
    width: 115%; 
    margin-right: -15%;
  }

  .is-multi-middle {
    width: 130%;
    margin-left: -15%;
  }

  .is-multi-end {
    border-radius: 0 4px 4px 0;
    margin-left: -15%;
    width: 115%;
  }
}

/* iPhone 14 Pro Max   */
@media (min-width: 400px) and (max-width: 450px) {
  .calendar-container {
    min-width: 100%;
    overflow: hidden;
  }
  .day-cell {
    padding: 2px;
    min-height: 60px;
    border-right: none;
    overflow: visible;
    max-width:45px;
  }
  .event-item {
    font-size: 10px;
    padding: 2px 4px;
    margin-top: 2px;
    width: 100%;
  }
  .events {
    margin-top: 2px;
  }
  
  .more-events {
    font-size: 11px;
  }
  .month-title{
    font-size: 25px;
  }
  
  .is-multi-start {
    border-radius: 4px 0 0 4px;
    width: 115%;
  }

  .is-multi-middle {
    width: 125%;
    margin-left: -10%;
  }

  .is-multi-end {
    border-radius: 0 4px 4px 0;
    margin-left: -10%;
    width: 110%;
  }
}

/* iPad Air*/
@media (min-width: 750px) and (max-width: 820px){
  .calendar-container {
    min-width: 100%;
    overflow: hidden; 
  }
  .calendar-header {
    flex-direction: column;
    gap: 8px;
  }
  .month-title {
    font-size: 30px;
  }

  .weekdays div {
    font-size: 15px;
    padding: 6px 0;
  }

  .day-cell {
    min-height: 100px;
    border-right: none;
    overflow: visible;
    
  }

  .month-picker-popup {
    width: 95%;
  }
  .event-item{
    font-size: 15px;
  }
  .is-multi-start {
    border-radius: 4px 0 0 4px;
    width: 115%;
  }

  .is-multi-middle {
    width: 125%;
    margin-left: -10%;
  }

  .is-multi-end {
    border-radius: 0 4px 4px 0;
    margin-left: -10%;
    width: 110%;
  }
}
</style>