<template>
  <!-- 載入 Flaticon CSS for icons  -->
  <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css"
  />
  <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/3.0.0/uicons-regular-rounded/css/uicons-regular-rounded.css'>

  <div class="app-container font-inter">
    <!-- 登入頁不顯示導覽列 -->
    <header v-if="showNavbar" class="top-bar">
      <!-- 漢堡按鈕已移除 -->

      <div class="logo">孕產婦健康照護管理系統</div>

      <!-- 桌面版導覽列 - Desktop/Tablet Landscape Only -->
      <nav class="nav">
        <router-link to="/home">首頁</router-link>
        <router-link to="/prenatal">產檢紀錄專區</router-link>
        <div class="dropdown">
          <router-link class="dropbtn" to="/education" :class="{ active: isEducationActive }">衛教資訊專區 
            <i class="fi fi-rr-angle-small-down"></i>
            
          </router-link>
          <div class="dropdown-content">
            <router-link to="/education/pregnancy">孕期衛教資訊</router-link>
            <router-link to="/education/prenatal-checkup"
              >產檢衛教資訊</router-link
            >
          </div>
        </div>

        <router-link to="/postpartum">產後專區</router-link>
        <router-link to="/self-assessment">自我評估專區</router-link>
        <router-link to="/Calendar-Diary">孕育時光表</router-link>
      </nav>

      <div class="icons-group">
        <!-- 通知圖標 - Desktop/Tablet Landscape Only -->
        <div
          class="notify-icon"
          @click="handleNotificationClick"
          aria-label="通知"
        >
          <i class="fi fi-sr-bell"></i>
          <span v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 99 ? "99+" : notificationCount }}
          </span>
        </div>

        <!-- Profile 圖標 (開啟右側邊欄) -->
        <div
          class="profile-icon"
          @click="openSidebar"
          aria-label="開啟個人資料側邊欄"
        >
          <!-- 如果有頭像就顯示頭像,沒有就顯示圖標 -->
          <img
            v-if="userAvatar"
            :src="userAvatar"
            class="avatar-preview"
            alt="使用者頭像"
          />
          <i v-else class="fi fi-sr-user"></i>
        </div>
      </div>
    </header>

    <!-- 顯示頁面內容 -->
    <div class="content-wrapper">
      <router-view />
    </div>

    <!-- Footer - 登入頁不顯示 -->
    <footer v-if="showNavbar" class="footer">
      <div class="footer-bottom">
        <div class="copyright">
          <p>
            &copy; {{ currentYear }} 孕產婦健康照護管理系統. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>

    <!-- Profile 側邊欄(右側滑出 - 統一行動版選單) -->
    <div v-if="showNavbar">
      <!-- 遮罩 -->
      <div
        v-if="isSidebarOpen"
        class="sidebar-overlay"
        @click="closeSidebar"
      ></div>

      <!-- 側邊欄主體 -->
      <div class="sidebar" :class="{ open: isSidebarOpen }">
        <!-- 頂部使用者資訊 -->
        <div class="sidebar-header">
          <div class="avatar">
            <!-- 如果有上傳頭像就顯示,沒有就顯示預設圖標 -->
            <img
              v-if="userAvatar"
              :src="userAvatar"
              class="avatar-image"
              alt="使用者頭像"
            />
            <i v-else class="fi fi-sr-user" style="font-size: 30px"></i>
          </div>
          <div class="user-info">
            <h3>{{ currentUser.name }}</h3>
            <p>{{ currentUser.email }}</p>
          </div>
        </div>

        <!-- 行動版通知區塊 (點擊後開啟 Modal) -->
        <div
          class="mobile-notify"
          @click="
            () => {
              handleNotificationClick();
              closeSidebar();
            }
          "
          tabindex="0"
          role="button"
        >
          <div class="dot">
            <i class="fi fi-sr-bell" style="color: #57aee2"></i>
            <span
              v-if="notificationCount > 0"
              class="notification-badge-mobile"
            >
              {{ notificationCount > 99 ? "99+" : notificationCount }}
            </span>
          </div>
          <span class="txt">通知中心 ({{ notificationCount }} 則未讀)</span>
          <i class="fi fi-sr-angle-right ml-auto" style="color: #764ba2"></i>
        </div>

        <!-- 導覽列連結 -->
        <nav class="sidebar-nav-links">
          <router-link to="/home" @click="closeSidebar">首頁</router-link>
          <router-link to="/prenatal" @click="closeSidebar"
            >產檢紀錄專區</router-link
          >
          <div class="dropdown">
            <router-link class="dropbtn" to="/education" :class="{ active: isEducationActive }" @click="closeSidebar">衛教資訊專區
              <i class="fi fi-rr-angle-small-down"></i>
            </router-link>
            <div class="dropdown-content">
              <router-link to="/education/pregnancy" @click="closeSidebar">孕期衛教資訊</router-link>
              <router-link to="/education/prenatal-checkup" @click="closeSidebar"
                >產檢衛教資訊</router-link>
            </div>
          </div>
          <router-link to="/postpartum" @click="closeSidebar">
            產後專區</router-link
          >
          <router-link to="/self-assessment" @click="closeSidebar"
            >自我評估專區</router-link
          >
          <router-link to="/Calendar-Diary" @click="closeSidebar"
            >孕育時光表</router-link
          >
        </nav>

        <!-- 個人資料按鈕 (原 sidebar-menu) -->
        <div class="sidebar-menu">
          <button class="menu-btn" @click="goProfile">
            <i class="fi fi-sr-user" style="font-size: 18px"></i> 個人資料
          </button>
        </div>

        <!-- 登出按鈕 -->
        <div class="sidebar-footer">
          <button class="logout-btn" @click="logout">
            <i class="fi fi-sr-exit" style="font-size: 18px"></i> 登出
          </button>
        </div>
      </div>
    </div>

    <!-- 登出確認視窗 -->
    <div v-if="showLogoutConfirm" class="logout-modal-overlay">
      <div class="logout-modal">
        <!-- 上方標題列含 X 按鈕 -->
        <div class="logout-header">
          <span class="logout-title">是否登出</span>
          <button class="close-btn" @click="cancelLogout">&times;</button>
        </div>

        <!-- 下方按鈕 -->
        <div class="logout-actions">
          <button class="cancel-btn" @click="cancelLogout">取消</button>
          <button class="confirm-btn" @click="confirmLogout">確認</button>
        </div>
      </div>
    </div>

    <div v-if="showNotificationModal" class="modal-overlay modal-notification">
      <div class="modal-window">
        <span class="close" @click="closeNotificationModal">×</span>

          <div class="notifications-scroll-area">
            <div v-if="checkupNotifications.length > 0">
              <h2>🔔 近期行程提醒({{ checkupNotifications.length }})</h2>
              <div class="notify-card checkup" 
                v-for="n in checkupNotifications" 
                :key="'checkup-' + n.id"
                @click="openEventDetail(n)">
                <div class="notify-icon">📆</div>
                <div class="notify-content">
                  <div class="notify-title">
                    <span>🕛 {{ formatDate(n.date) }} {{ n.title }}</span>
                    <span class="days-remaining" :class="{ 'is-today': getDaysRemaining(n.date) === '今天' }">
                      {{ getDaysRemaining(n.date) }}
                    </span>
                  </div>
                  <div class="notify-msg">{{ n.message }}</div>
                </div>
              </div>
            </div>
            
            <div v-if="educationNotifications.length > 0 || reviewNotifications.length > 0">
              <h2>📝 衛教提醒 ({{ educationNotifications.length + reviewNotifications.length }})</h2>
              <div class="edu-grid">

                <div 
                  class="edu-grid-card review"
                  v-for="n in reviewNotifications" 
                  :key="'review-' + n.article_id"
                  @click="openEducation(n)"
                >
                  <span class="status-badge review-badge">
                    複習
                  </span>

                  <div class="card-icon-wrapper">
                    <i class="fi fi-rr-refresh"></i>
                  </div>

                  <div class="card-title">
                    {{ n.title || '衛教資訊' }}
                  </div>
                  <div v-if="n.message" class="review-msg-hint">
                    {{ n.message }}
                  </div>
                </div>

                <div 
                  class="edu-grid-card" 
                  v-for="n in educationNotifications" 
                  :key="'edu-' + n.id"
                  @click="openEducation(n)"
                >
                <span class="status-badge" :class="{ 'unread': !n.read }">
                  ● 未讀
                </span>
                <div class="card-icon-wrapper">
                  <i class="fi fi-rr-book-alt"></i>
                </div>
                <div class="card-title">{{ n.title || '衛教資訊' }}</div>
              </div>
            </div>
          </div>
          <div v-if="
              checkupNotifications.length === 0 && 
              educationNotifications.length === 0 &&
              reviewNotifications.length === 0
            " style="text-align: center; padding: 20px;">
            <p>目前暫無新提醒</p>
          </div>
        </div>
        <button class="confirm-btn" @click="closeNotificationModal">
          確認
        </button>
      </div>
    </div>
  </div>

<!-- 行程詳細資訊彈窗 -->
<!-- <EventDetailModal
  v-if="selectedEvent"
  :show="showEventDetail"
  :event="selectedEvent"
  @close="closeEventDetail"
  @delete="handleDeleteEvent"
  @edit="handleEditEvent"
/> -->
</template>

<script setup>
import { ref, computed, onMounted,onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "./services/api.js";
import { jwtDecode } from "jwt-decode";
import { forceLogout } from "./services/api.js"; 

const route = useRoute();
const router = useRouter();

function handleDayClick(day) {
  console.log(day);
}

function handleMonthChange(month) {
  console.log(month);
}

/* 基礎狀態 */

// 登入頁不顯示 Navbar 與 Footer
const showNavbar = computed(() => route.path !== "/");

// 取得當前年份
const currentYear = computed(() => new Date().getFullYear());

// 使用者資料
const currentUser = ref({
  name: "載入中...",
  email: "",
});

// 使用者頭像
const userAvatar = ref("");

// 載入使用者名字和頭像
const loadUserData = () => {
  const userStr = sessionStorage.getItem("user");
  if (userStr) {
    try {
      const parsed = JSON.parse(sessionStorage.getItem("user") || "{}");

      currentUser.value.name = parsed.name || "使用者";
      currentUser.value.email = parsed.email || "未提供電子信箱";
      userAvatar.value = parsed.user_file_path || "";
      
    } catch (e) {
      console.error("解析使用者資料失敗", e);
    }
  }
};

// 認證狀態
const showLogoutConfirm = ref(false);

/* 側邊欄控制(Unified Menu / Profile)*/

const isSidebarOpen = ref(false);
const openSidebar = () => {
  isSidebarOpen.value = true
};
const closeSidebar = () => {
  isSidebarOpen.value = false;
};


// 通知 Modal 狀態
const showNotificationModal = ref(false);

const openNotificationModal = () => {
  showNotificationModal.value = true;

  // 開啟後標記所有為已讀
  notifications.value = notifications.value.map((n) => ({
    ...n,
    read: true,
  }));
};

const closeNotificationModal = () => {
  showNotificationModal.value = false;
};

// 點擊通知圖標的處理函式：先取得最新通知，再開啟 Modal
const handleNotificationClick = async () => {

  await fetchNotifications();

  openNotificationModal();

};

/* 登出 */

const goProfile = () => {
  closeSidebar();
  console.log("導航到個人資料頁");
  router.push("/profile"); // 假設有 profile 頁面
};

const logout = () => {
  showLogoutConfirm.value = true;
};

/* 在彈出的確認視窗點擊「確認」時觸發：真正的清除資料與導向登入頁 */
const confirmLogout = () => {
  console.log("正在執行登出程序...");
  
  // 1. 關閉 UI 元件
  isSidebarOpen.value = false;
  showLogoutConfirm.value = false;

  // 2. 清除所有可能的憑證 (依據你 router/index.js 守衛的檢查對象)
  sessionStorage.clear(); // 清除 sessionStorage 中的 user 資料和登入旗標
  localStorage.removeItem("token"); // 如果有使用 localStorage 儲存 JWT，這裡也要清除

  // 4. 重置本頁變數狀態
  currentUser.value = { name: "", email: "" };
  userAvatar.value = "";

  console.log("SessionStorage 已清理，跳轉至登入頁");

  // 5. 跳轉並重整 (確保狀態完全乾淨)
  router.push("/").then(() => {
    window.location.reload(); 
  });
};

const cancelLogout = () => {
  showLogoutConfirm.value = false;
};

// 檢查 Token 是否過期的函式
const checkTokenExpiry = () => {
  const token = localStorage.getItem("token");
  const user = sessionStorage.getItem("user");

  // ❗ 沒登入就不要檢查
  if (!token || !user) return;

  if (route.path === "/") return; //在login頁面時不要檢查

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      console.warn("偵測到 Token 已過期，執行自動登出");
      forceLogout("登入已逾時，系統已自動為您登出");
    }
  } catch (error) {
    console.error("Token 解析失敗", error);
    forceLogout("登入狀態異常，請重新登入");
  }
};

let expiryCheckTimer = null;

onMounted(async () => {
  loadUserData();
  
  // 1. 頁面重整或開啟時立即檢查一次
  checkTokenExpiry();

  // 2. 設定定時器，每 1 分鐘自動檢查一次 (主動監控)
  expiryCheckTimer = setInterval(checkTokenExpiry, 60000); 

  await fetchNotifications();
  window.addEventListener("user-data-updated", loadUserData);
});

onUnmounted(() => {
  window.removeEventListener("user-data-updated", loadUserData);
  // 清除定時器
  if (expiryCheckTimer) clearInterval(expiryCheckTimer);
});

/* -----------------------------
   自動行為：換頁處理與通知彈窗
----------------------------- */
watch(
  () => route.path,
  async (newPath) => {
    loadUserData();
    // 1. 處理「剛登入後第一次進首頁」的彈窗通知
    if (newPath === "/home") {
      // 統一檢查 sessionStorage 中的旗標
      const justLoggedIn = sessionStorage.getItem("justLoggedIn");
      const hasShown = sessionStorage.getItem("homeNotificationShown");

      // 觸發條件：有剛登入旗標，且「本次會話」尚未顯示過通知
      if (justLoggedIn === "true" || !hasShown) {
        await fetchNotifications(); // 確保通知是最新的
        showNotificationModal.value = true;
        
        // 顯示後立刻標記為已顯示，並移除登入旗標
        sessionStorage.setItem("homeNotificationShown", "true");
        sessionStorage.removeItem("justLoggedIn");
        
        // 同步移除舊的 localStorage 標記以免干擾 (清理舊資料)
        localStorage.removeItem("homeNotificationShown");
      }
    }

    // 2. 換頁時自動關閉側邊欄
    closeSidebar();
  },
  { immediate: true }
);


/*通知數量控制 */
// 通知列表
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const notifications = ref([]);

// 分離產檢提醒
const checkupNotifications = computed(() => {
  return notifications.value.filter(n => n.type === 'checkup');
});

// 分離衛教提醒
const educationNotifications = computed(() => {
  return notifications.value.filter(n => n.type === 'education');
});

// 分離複習提醒
const reviewNotifications = computed(() => {
  return notifications.value.filter(n => n.type === 'review');
});



// 計算週數函式(與home.vue一致)
const getPregnancyWeek = (lmpDate) => {
  if (!lmpDate) return null;
  const today = new Date();
  const lmp = new Date(lmpDate);
  const diffTime = Math.abs(today - lmp);
  if (diffTime < 0) return null;

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
};

const isFetching = ref(false);

// 從後端 API 取得通知
const fetchNotifications = async () => {
  if (isFetching.value) return; // 防止重複請求
  
  const userStr = sessionStorage.getItem("user");
  const token = localStorage.getItem("token");
  
  if (!userStr || !token) {
    console.warn("未找到 Token 或使用者資料，停止發送請求");
    return;
  }
  
  const user = JSON.parse(userStr);
  isFetching.value = true;

  try {
    let currentWeek = null;

    // 1. 嘗試從 3001 取得個人資料 (LMP)
    try {
      const profileRes = await api.get(`http://192.168.100.6:3000/api/personal_information/${user.user_id}`);
      if (profileRes.data && profileRes.data.success) {
        currentWeek = getPregnancyWeek(profileRes.data.data.lmpDate);
        console.log(`[通知檢查] 目前週數: ${currentWeek}`);
      }
    } catch (e) {
      console.warn("無法從 3000 取得週數，繼續嘗試抓取基礎通知...");
    }

    const res = await api.get(`http://192.168.100.6:3002/api/notifications/${user.user_id}`, {
      params: { week: currentWeek }
    });

    const data = res.data;

    // 3. 更新前端狀態
    if (Array.isArray(data)) {
      notifications.value = data.map((n, index) => ({
        id: n.id || index + 1,
        ...n,
        read: false
      }));
      console.log("成功取得合併後的通知列表:", notifications.value);
    }
    
  } catch (error) {
    console.error("通知取得流程發生嚴重錯誤:", error);
  } finally {
    isFetching.value = false;
  }
};

// 計算未讀通知數量
const notificationCount = computed(() => {
  const checkupUnread = checkupNotifications.value.filter(n => !n.read).length;
  const eduUnread = educationNotifications.value.filter(n => !n.read).length;
  const reviewUnread = reviewNotifications.value.filter(n => !n.read).length; // 加入這一行
  return checkupUnread + eduUnread + reviewUnread;
});

// 衛教專區是否為當前頁面
const isEducationActive = computed(() => {
  return route.path.startsWith('/education');
});

// 點擊衛教通知後，標記已讀、開啟連結、重新抓取通知
const openEducation = async (notification) => {
  const userStr = sessionStorage.getItem("user");
  if (!userStr) return;

  const user = JSON.parse(userStr);

  try {
    await api.post("http://192.168.100.6:3000/api/read_records", {
      user_id: user.user_id,
      article_id: notification.article_id
    });

    window.open(notification.link, "_blank");

    await fetchNotifications();

  } catch (error) {
    console.error("標記已讀失敗", error);
  }
};

// 計算距離今天還有幾天
const getDaysRemaining = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 將時間歸零，只比對日期
  
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "今天";
  if (diffDays < 0) return `已過 ${Math.abs(diffDays)} 天`;
  return `還有 ${diffDays} 天`;
};


let notificationTimer = null;

onMounted(() => {
  notificationTimer = setInterval(fetchNotifications, 300000);
});

onUnmounted(() => {
  clearInterval(notificationTimer);
});

</script>

<style scoped>
.review-badge {
  background: #e6f4ff !important;
  color: #1890ff !important;
}

.edu-grid-card.review {
  border: 1px solid #d6eaff;
  background: #fafcff;
}

.edu-grid-card.review:hover {
  border-color: #1890ff;
}

.notify-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  position: relative;
  background: #fff;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  margin-top: 10px;
  border-left: 4px solid #57aee2;
  /* cursor: pointer; */
}

.notify-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  /* border-color: #e56767; */
}

/* 左側 icon */
.notify-icon {
  font-size: 22px;
  display: flex;
  align-items: flex-start;
}

/* 內容 */
.notify-content {
  flex: 1;
}

.notify-title {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 讓標題與天數分開在兩頭 */
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
}

/* 天數標籤 */
.days-remaining {
  font-size: 12px;
  background-color: #66b8d1;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  margin-left: 8px;
  white-space: nowrap; 
}

/* 「今天」樣式 */
.days-remaining.is-today {
  background-color: #ff4d4f;
  color: #ffffff;
  animation: pulse 2s infinite; 
}

/* 調整卡片內的內容佈局，確保標題不會被擠壓 */
.notify-content {
  flex: 1;
  min-width: 0; 
}

.notify-date {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}

.notify-msg {
  font-size: 14px;
  color: #444;
}

/* 衛教宮格容器佈局 */
.edu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 兩欄佈局 */
  gap: 12px;
  margin-bottom: 20px;
  margin-top: 10px;
}

/* 單張卡片樣式 */
.edu-grid-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 16px;
  padding: 20px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 130px;
}

.edu-grid-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #57aee2;
}

/* 卡片內圖示 */
.card-icon-wrapper {
  width: 45px;
  height: 45px;
  background: #f0f7ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.card-icon-wrapper i {
  font-size: 20px;
  color: #57aee2;
}

/* 卡片標題 */
.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  line-height: 1.4;
  /* 限制標題長度 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 未讀標籤 */
.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  background: #f0f0f0;
  color: #ff4d4f;
}

.status-badge.unread {
  background: #fff0f0;
  color: #ff4d4f;
  font-weight: 600;
}

/* RWD 調整：手機版改為單欄或縮小間距 */
@media (max-width: 480px) {
  .edu-grid {
    gap: 8px;
  }
  .edu-grid-card {
    padding: 15px 10px;
  }
}

/* ===========================================================
   App.vue - 統一重構 RWD CSS
   =========================================================== */
.font-inter {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
}

/* ---------------------------
   Base layout
   --------------------------- */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f8fb;
  color: #223;
}

.content-wrapper {
  flex: 1;
}

/* ---------------------------
   Navbar (桌機優先樣式)
   --------------------------- */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(135deg, #fff);
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 1200;
}

/* logo */
.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: #57aee2;
  letter-spacing: 0.3px;
}

/* nav */
.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex: 1;
  justify-content: center; /* 桌面版導覽列置中 */
}

.nav :hover {
  cursor: pointer;
  color: #999;
}

.nav a {
  color: #000;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  position: relative;
}
.nav a:hover {
  opacity: 0.9;
}
.nav a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 0;
  height: 2px;
  background: #888;
  transition: width 0.25s ease;
}
.nav a:hover::after,
.nav a.router-link-active::after {
  width: 100%;
}


/* icons group (桌機時靠右) */
.icons-group {
  display: flex;
  gap: 14px;
  align-items: center;
}

/* notify-icon - 桌面版顯示 */
.notify-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  position: relative;
  color: #57aee2;
  transition: transform 0.2s;
}
.notify-icon:hover {
  transform: scale(1.05);
}
.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4d4f;
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  line-height: 1;
}

/* profile icon */
.profile-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #57aee2;
  border: 2px solid #57aee2;
  transition: background 0.2s;
  overflow: hidden; /* 確保圖片不會超出邊界 */
}
.profile-icon:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 頭像預覽圖片 (導覽列) */
.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* ---------------------------
   Sidebar (右側 Unified Menu)
   --------------------------- */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  z-index: 1900;
}

.sidebar {
  position: fixed;
  top: 0;
  right: -100%; /* 預設完全隱藏 */
  width: 320px;
  max-width: 85%; /* 確保在小螢幕上不會超過 */
  height: 100vh;
  background: #fff;
  box-shadow: -6px 0 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: right 0.32s ease;
  z-index: 2000;
}

.sidebar.open {
  right: 0;
}

/* 頂部使用者資訊 */
.sidebar-header {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 5px;
}
.sidebar .avatar {
  min-width: 60px; /* 確保頭像不會被擠壓 */
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #57aee2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  overflow: hidden; /* 確保圖片不會超出邊界 */
}

/* 側邊欄頭像圖片 */
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.sidebar .user-info h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}
.sidebar .user-info p {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

/* 行動版通知區塊 (取代原 mobile-nav 內通知) */
.mobile-notify {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 6px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f8f9ff, #eef2ff);
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}
.mobile-notify:hover {
  background: #eef2ff;
}
.mobile-notify .dot {
  min-width: 36px;
  min-height: 36px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  position: relative;
}
.mobile-notify .txt {
  font-weight: 600;
  color: #333;
}
.notification-badge-mobile {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4d4f;
  color: #fff;
  font-size: 0.65rem;
  padding: 1px 5px;
  border-radius: 999px;
  font-weight: 700;
  line-height: 1.1;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

/* 導覽列連結*/
.sidebar-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0; /* 讓 border-bottom 控制間隔 */
  margin-top: 5px;
  margin-bottom: 20px;
  padding: 10px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.sidebar-nav-links a {
  color: #222;
  text-decoration: none;
  font-size: 1.02rem;
  padding: 12px 4px;
  border-bottom: 1px solid #f2f3f5;
  display: flex;
  align-items: center;
  transition: color 0.2s, background 0.2s;
}
.sidebar-nav-links a:hover {
  background: #f8f8f8;
}
.sidebar-nav-links a:last-of-type {
  border-bottom: none;
}
.sidebar-nav-links a.router-link-active {
  color: #006aa8;
  font-weight: 700;
  background: #f4f6ff;
  border-radius: 4px;
}

/* 個人資料按鈕區 */
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 登出按鈕所在區域固定在底部 */
.sidebar-footer {
  margin-top: auto;
  padding-bottom: 50px;
}

/* sidebar buttons */
.menu-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: #57aee2;
  color: white;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
  transition: background 0.3s ease;
}
.menu-btn:hover {
  background: #764ba2;
}

/* 登出按鈕 */
.logout-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: #e63946;
  color: white;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  transition: background 0.3s ease;
}
.logout-btn:hover {
  background: #d62f3a;
}

/* ---------------------------
   Footer
   --------------------------- */
.footer {
  margin-top: auto;
  background: linear-gradient(135deg, #57aee2);
  color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
.footer-bottom {
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.footer p {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.85;
}

/* ---------------------------
   Modals (Logout Confirmation & Notification)
   --------------------------- */
.logout-modal-overlay,
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout-modal-overlay {
  z-index: 5000;
}
.modal-overlay {
  z-index: 4000; /* 通知 Modal 優先級略低於登出確認 */
}

.logout-modal,
.modal-window {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 0;
  overflow: hidden;
}

.modal-window {
  max-width: 520px; /* 通知 Modal 稍寬 */
  padding: 30px;
  position: relative;
}

.logout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #eee;
}
.logout-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}
.close,
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.close {
  position: absolute;
  right: 15px;
  top: 15px;
}

.logout-actions {
  padding: 1.2rem;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}
.cancel-btn {
  background: #f1f1f1;
  color: #333;
}
.cancel-btn:hover {
  background: #e0e0e0;
}
.confirm-btn {
  background: #758ecd; /* 確認按鈕顏色改為藍色系 */
  color: #fff;
  font-size: 16px;
}
.confirm-btn:hover {
  background: #627cb2;
}
.logout-actions .confirm-btn {
  background: #e63946; /* 登出確認按鈕維持紅色 */
}
.logout-actions .confirm-btn:hover {
  background: #d62f3a;
}

/* 通知 Modal 內容樣式 */
.modal-window h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-top: 15px;
  margin-bottom: 5px;
}

.modal-window p {
  color: #555;
  margin-bottom: 10px;
}

.modal-window .confirm-btn {
  margin-top: 20px;
  float: right;
}
.modal-window::after {
  content: "";
  display: table;
  clear: both;
}

/* ------------
  Dropdown 整體 
  ---------------*/
.dropdown {
  position: relative;
  display: inline-block;
}
/* 下拉選單內容 */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: white;
  min-width: 160px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  z-index: 10;
  padding: 10px 0;
}
/* 下拉選項 */
.dropdown-content a {
  display: block;
  padding: 10px 16px;
  color: #555;
  text-decoration: none;
  font-size: 16px;
}
/* .dropdown-content a:hover {
  background: #f0f0f0;
} */

/* 滑鼠 hover 顯示下拉 */
.dropdown:hover .dropdown-content {
  display: block; 
}

.dropdown:hover .dropbtn::after {
  width: 100%; /* 確保下拉選單展開時底線一直存在 */
  background: #aaa; /* 可以使用與 router-link-active 不同的顏色來區分 */
}

/* 確保當 .dropbtn 已經是 active 時，:hover 樣式不會覆蓋它的顏色 */
.dropdown:hover .dropbtn.active::after  {
    /* 確保 active 狀態優先 */
    background: #000; /* 假設您希望 active 顏色與 Logo 一致 */
}

/* 衛教資訊專區 - 強制 active*/
.dropbtn.active {
  font-weight: 600;
}
/* 讓dropbtn跟router-link-active一樣的底線效果 */
.dropbtn.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 100%;
  height: 2px;
  background: #888888;
}

/* 卷軸樣式 */
.notifications-scroll-area {
  max-height: 400px;    /* 設定最大高度，超過則出現卷軸 */
  overflow-y: auto;     /* 垂直方向自動出現卷軸 */
  padding-right: 10px;  /* 留一點空間給卷軸，避免擋到文字 */
  margin-bottom: 15px;
  
}
.notifications-scroll-area::-webkit-scrollbar { /* 整體卷軸 */
  width: 8px;
}
.notifications-scroll-area::-webkit-scrollbar-track { /* 卷軸軌道 */
  background: #f1f1f1;
  border-radius: 10px;
  margin-top: 30px;
}
.notifications-scroll-area::-webkit-scrollbar-thumb { /* 卷軸滑塊 */
  background: #ccc;
  border-radius: 10px;
}
.notifications-scroll-area::-webkit-scrollbar-thumb:hover { /* 滑塊 hover */
  background: #57aee2;
}

/* 通知內容細節樣式 */
.notification-item {
  margin-left: 5px; 
  margin-bottom: 20px;
  border-left: 3px solid #57aee2; /* 增加左側條紋增加辨識度 */
  padding-left: 12px;
}
.notification-item h3 {
  margin-bottom: 5px; 
  color: #57aee2;
  font-size: 1.1rem;
}
.notification-item p {
  margin: 0; 
  line-height: 1.6; 
  font-weight: 500;
  color: #555;
}

.education-list {
  margin-left: 5px; 
  padding-left: 20px; 
  list-style-type: disc;
}
.education-list li {
  margin-bottom: 15px;
  font-weight: 500;
  line-height: 1.5;
  color: #444;
}
.edu-link {
  color: #57aee2;
  text-decoration: underline;
  font-size: 0.9rem;
  display: inline-block;
  margin-top: 4px;
}

.empty-notify {
  text-align: center; 
  padding: 40px 20px;
  color: #999;
}


/* ---------------------------
    Responsive Breakpoints 
   --------------------------- */
@media (max-width: 1024px) {
  .nav {
    display: none;
  }
  
  .logo {
    font-size: 1.25rem;
  }
  .top-bar {
    padding: 0.85rem 1.5rem;
  }
  .notify-icon {
    width: 40px;
    height: 40px;
  }
  .profile-icon {
    width: 36px;
    height: 36px;
  }
}

/* ---------------------------
   Mobile Landscape & Tablet Portrait (max-width: 768px)
   - 主要行動裝置 UI 模式
   --------------------------- */
@media (max-width: 768px) {
  /* Header 佈局變更 */
  .nav {
    display: none;
  } /* 隱藏桌面導覽列 */
  .notify-icon {
    display: none;
  } /* 隱藏頂部通知圖標 (移入 Sidebar) */

  /* Logo 置中,icons 靠右 */
  .top-bar {
    padding: 0.8rem 1rem;
  }
  .logo {
    flex: 1;
    text-align: center;
    font-size: 1.15rem;
  }
  .icons-group {
    margin-left: auto;
    gap: 10px;
  }

  /* profile icon 縮小 */
  .profile-icon {
    width: 34px;
    height: 34px;
  }

  /* Sidebar 限制最大寬度並確保完全隱藏 */
  .sidebar {
    max-width: 85%;
    width: 280px;
  }

  /* Footer 調整 */
  .footer-bottom {
    padding: 0.8rem 1rem;
  }
}

/* ---------------------------
   Extra Small Mobile (max-width: 420px)
   --------------------------- */
@media (max-width: 420px) {
  .logo {
    font-size: 1rem;
  }
  .top-bar {
    padding: 0.6rem 0.8rem;
  }
  .profile-icon {
    width: 30px;
    height: 30px;
  }
  .footer-bottom {
    padding: 0.6rem 0.8rem;
  }
  .modal-window {
    padding: 20px;
  }
}
</style>