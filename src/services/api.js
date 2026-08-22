import axios from "axios";
import router from "../router/index.js";
import { ElMessageBox, ElMessage } from "element-plus"; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// 標記是否正在跳轉，避免重複彈出多個視窗
let isRedirecting = false;


// 封裝統一的強制登出函式
export const forceLogout = async (message = "登入已逾時，請重新登入") => {
  if (isRedirecting) return;
  isRedirecting = true;

  try {
    await ElMessageBox.alert(message, "系統通知", {
      confirmButtonText: "確定",
      type: "warning",
    });
  } finally {
    localStorage.removeItem("token");
    sessionStorage.clear();
    isRedirecting = false;
    router.push("/").then(() => {
      window.location.reload();
    });
  }
};


export const getPersonalInfo = (id) =>
  api.get(`/personal_information/${id}`);

export const getNotifications = (id, week) =>
  api.get(`/notifications/${id}`, { params: { week } });


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 全局攔截器（統一處理）
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    const status = err.response?.status;

    // 1. 網路錯誤
    if (!err.response) {
      ElMessage.error("網路異常，請檢查連線");
      return Promise.reject(err);
    }

    // 2. 判斷是否為 auth API
    const isAuthRequest = config.url.includes('/api/auth/');

    // 3. Token 過期 / 無權限
    if ((status === 401 || status === 403) && !isRedirecting) {

      // 登入 API 不處理（交給頁面）
      if (isAuthRequest) {
        return Promise.reject(err);
      }

      isRedirecting = true;

      try {
        await ElMessageBox.alert(
          "登入已逾時，請重新登入",
          "系統通知",
          {
            confirmButtonText: "確定",
            type: "warning",
          }
        );
      } finally {
        localStorage.removeItem("token");
        sessionStorage.clear();
        isRedirecting = false;
        // 導回登入頁
        router.push("/").then(() => {
          window.location.reload();
        });
      }

      return Promise.reject(err);
    }

    // 4. 429
    if (status === 429 && !isAuthRequest) {
      ElMessage.warning("操作過於頻繁，請稍後再試");
    }

    // 5. 500+
    if (status >= 500) {
      ElMessage.error("伺服器錯誤，請稍後再試");
    }

    return Promise.reject(err);
  }
);

export default api;