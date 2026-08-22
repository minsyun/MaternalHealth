<template>
  <div class="login-page">
    <h1>孕產婦健康照護管理系統</h1>

    <div class="login-box">
      <div v-show="showIdPhone">
        <label>身分證字號</label>
        <input
          v-model="idNumber"
          :class="{ error: idError }"
          type="text"
          placeholder="請輸入身分證字號"
        />
        <p class="error-text" v-if="idError">{{ idError }}</p>
      </div>

      <div v-show="showIdPhone">
        <label>手機號碼</label>
        <input
          v-model="phoneNumber"
          type="tel"
          autocomplete="tel"
          placeholder="請輸入手機號碼"
        />
        <p class="error-text" v-if="phoneError">{{ phoneError }}</p>
      </div>

      <button v-show="showIdPhone" @click="verification" :disabled="isCounting || isLoading">傳送OTP驗證碼至 Email</button>

      <div v-show="!showIdPhone">
        <label>驗證碼</label>
        <div class="otp-container">
          <input
            ref="hiddenOtpInput"
            v-model="fullOtp"
            type="text"
            maxlength="6"
            autocomplete="one-time-code"
            name="one-time-code"
            inputmode="numeric"
            pattern="[0-9]*"
            class="hidden-input"
          />

          <div class="otp-visual-group">
            <div
              v-for="(digit, index) in 6"
              :key="index"
              class="otp-input-visual"
              :class="{ 'is-active': fullOtp.length === index }"
              @click="focusHiddenInput"
            >
              {{ fullOtp[index] || '' }}
            </div>
          </div>
        </div>
        <p class="error-text" v-if="smsError">{{ smsError }}</p>
        
        <button 
          class="text-button" 
          @click="resendsms" 
          :disabled="isCounting"
          :style="{ cursor: isCounting ? 'not-allowed' : 'pointer', color: isCounting ? '#aaa' : '#007bff' }"
        >
          {{ isCounting ? `${countdown} 秒後重新寄送` : '重新寄送驗證碼' }}
        </button>
        <button class="text-button" @click="resendPhoneInput">重新輸入手機電話號碼</button>
        <button class="button" @click="sendsms">驗證</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import { ElMessage, ElMessageBox,ElLoading } from "element-plus";

const router = useRouter();
const demoMode = false; // 建議接後端時關閉 demo

// 讓驗證碼輸入欄位的分段式UI同時支援「自動填充」
const fullOtp = ref("");
const hiddenOtpInput = ref(null);

const focusHiddenInput = () => {
  hiddenOtpInput.value?.focus();
};

onMounted(() => {
  document.addEventListener("click", () => {
    hiddenOtpInput.value?.focus();
  });
});

const syncDigits = () => {
  // 當 fullOtp 改變（不管是手打還是自動填充），視覺格子會跟著響應
  console.log("當前驗證碼：", fullOtp.value);
};

// 狀態控制
const showIdPhone = ref(true);
const isCounting = ref(false);
const countdown = ref(60);
let timer = null;

// 表單資料
const idNumber = ref("");
const phoneNumber = ref("");
const smsCode = ref("");

// 錯誤訊息
const idError = ref("");
const phoneError = ref("");
const smsError = ref("");

// OTP輸入框相關
const otpDigits = ref(["", "", "", "", "", ""]);
const otpRefs = ref([]);

// 驗證函式：身分證字號格式 (台灣標準：1位大寫字母 + 1位(1或2) + 8位數字)
const validateId = (id) => {
  const re = /^[A-Z][12]\d{8}$/;
  return re.test(id);
};

// 驗證函式：手機號碼格式 (台灣標準：09開頭 + 8位數字)
const validatePhone = (phone) => {
  const re = /^09\d{8}$/;
  return re.test(phone);
};


const savedStep = sessionStorage.getItem("otp_step");

if (savedStep === "verify") {
  showIdPhone.value = false;
}


// 1. 啟動倒數計時
const startCountdown = (seconds = 60) => {
  if (timer) clearInterval(timer);
  isCounting.value = true;
  countdown.value = seconds;

  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      isCounting.value = false;
    }
  }, 1000);
};

// 2. 第一步：請求驗證碼 (verification)
const isLoading = ref(false);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const verification = async () => {
  idNumber.value = idNumber.value.trim().toUpperCase();
  phoneNumber.value = phoneNumber.value.trim();

  idError.value = "";
  phoneError.value = "";
  let hasError = false;

  // 驗證輸入
  if (!idNumber.value) {
    idError.value = "請輸入身分證字號";
    hasError = true;
  } else if (!validateId(idNumber.value)) {
    idError.value = "身分證格式錯誤，首字需大寫（例：A123456789）";
    hasError = true;
  }

  if (!phoneNumber.value) {
    phoneError.value = "請輸入手機號碼";
    hasError = true;
  } else if (!validatePhone(phoneNumber.value)) {
    phoneError.value = "手機格式錯誤，需為 09 開頭 10 碼";
    hasError = true;
  }

  if (hasError) return;

  // 模擬loading請求延遲
  let loadingInstance;

  try {
    isLoading.value = true;

    // 開啟 loading
    loadingInstance = ElLoading.service({
      lock: true,
      text: "驗證碼寄送中...",
      background: "rgba(0, 0, 0, 0.5)",
    });

    const start = Date.now();

    // const res = await api.post("/api/auth/request-otp", {
    //   national_id: idNumber.value,
    //   phone_number: phoneNumber.value,
    // });
    const res = await api.post("/api/auth/request-otp", {
      national_id: idNumber.value,
      phone_number: phoneNumber.value,
    }, { timeout: 30000 });

    const elapsed = Date.now() - start;
    if (elapsed < 500) {
      await delay(500 - elapsed);
    }

    if (res.data.success) {
      sessionStorage.setItem("temp_user_id", res.data.user_id);

      showIdPhone.value = false;
      smsCode.value = "";

      startCountdown();
      sessionStorage.setItem("otp_step", "verify");
    }

  } catch (err) {
    const status = err.response?.status;
    const errorMsg = err.response?.data?.message || "發送失敗";

    if (status === 429) {
      const remaining = err.response?.data?.remaining || 60;

      // 先關 loading
      if (loadingInstance) loadingInstance.close();

       // toast（立即提示）
      ElMessage.warning(`請 ${remaining} 秒後再試`);

      await ElMessageBox.alert(
        `操作過於頻繁，請 ${remaining} 秒後再試`,
        "系統提示",
        { confirmButtonText: "知道了", type: "warning" }
      );

      startCountdown(remaining);
      return;
    }

    if (!err.response) {
      ElMessage.error("網路連線異常");
      return;
    }

    if (errorMsg.includes("身分證")) {
      idError.value = errorMsg;
    } else if (errorMsg.includes("手機")) {
      phoneError.value = errorMsg;
    } else {
      ElMessage.error(errorMsg);
    }

  } finally {
    isLoading.value = false;

    // 關閉 loading
    if (loadingInstance) loadingInstance.close();
  }
};

// 3. 第二步：驗證驗證碼並登入 (sendsms)
const sendsms = async () => {
  const tempId = sessionStorage.getItem("temp_user_id"); 
  if (!tempId) {
    smsError.value = "請先獲取驗證碼";
    return;
  }

  smsError.value = "";
  try {
    const res = await api.post("/api/auth/verify-otp", {
      user_id: tempId, 
      otp: getOtp(),
    });

    if (res.data.success) {
      console.log("登入成功，後端資料：", res.data);

      localStorage.setItem("token", res.data.token); // 儲存 JWT 以供後續 API 認證使用

      // 獲取使用者個人資料
      const profileRes = await api.get("/api/profile/");
      const userData = {
        user_id: res.data.user.user_id,
        name: profileRes.data.name,
        email: profileRes.data.email || "",
        user_file_path: profileRes.data.user_file_path || ""
      };
      
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("justLoggedIn", "true");

      router.push("/home");
    }
  } catch (err) {
    console.error("Login Error:", err);
    smsError.value = err.response?.data?.message || "驗證碼錯誤";
  }
};

// 4. 重新寄送驗證碼
const resendsms = async () => {
  if (isCounting.value) return;
  await verification(); // 直接複用請求邏輯
};

// 5. 回到上一步
const resendPhoneInput = () => {
  showIdPhone.value = true;
  sessionStorage.removeItem("otp_step");
  smsCode.value = "";
  if (timer) clearInterval(timer);
  isCounting.value = false;
};

// 組件卸載時清除計時器避免記憶體洩漏
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

onMounted(() => {
  const savedStep = sessionStorage.getItem("otp_step");
  if (savedStep === "verify") {
    showIdPhone.value = false;

    nextTick(() => {
      hiddenOtpInput.value?.focus();
    });
  }
});


// ----------------
// OTP輸入框處理
// ----------------

// 組合成完整 OTP
const getOtp = () => fullOtp.value;

watch(fullOtp, (val) => {
  if (val.length === 6) {
    sendsms();
  }
});

// Backspace 處理
const handleKeydown = (e, index) => {
  if (e.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    nextTick(() => {
      otpRefs.value[index - 1].focus();
    });
  }
};

// 貼上 OTP
const handlePaste = (e) => {
  const pasteData = e.clipboardData.getData("text").slice(0, 6);

  if (!/^\d+$/.test(pasteData)) return;

  pasteData.split("").forEach((char, i) => {
    otpDigits.value[i] = char;
  });

  nextTick(() => {
    otpRefs.value[Math.min(pasteData.length - 1, 5)].focus();
  });
};

watch(showIdPhone, async (val) => {
  if (!val) {
    await nextTick();
    otpRefs.value[0]?.focus();
  }
});
</script>


<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #ffffff;
  font-family: Arial, sans-serif;

  /*動畫 */
  /* 1. 定義漸層背景 */
  background: linear-gradient(120deg, #c6eedf, #65b1dd);

  /* 2. 設定背景尺寸放大，為動畫提供空間 */
  background-size: 300% 300%;

  /* 4. 應用動畫 */
  animation: my-animation 5s ease infinite; /* 動畫名稱、時間、時間函式、無限循環 */
}
/* 3. 定義動畫的關鍵影格 */
@keyframes my-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 80% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

h1 {
  font-size: 36px;
  color: #36404a;
  margin-bottom: 40px;
  font-weight: 700;
}

.login-box {
  width: 380px;
  background: #f1f5f9;
  border: 1px solid #d1d5db;
  padding: 30px;
  border-radius: 6px;
  box-sizing: border-box;
}

label {
  display: block;
  font-size: 20px;
  margin-bottom: 6px;
  color: #374151;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 20px;
  box-sizing: border-box;
}

.text-button {
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
}

.text-button:hover {
  background: none;
}

button {
  width: 100%;
  background: #475569;
  color: white;
  padding: 10px;
  font-size: 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background: #334155;
}

.error {
  border: 1px solid #e11d48 !important; /* 深紅色 */
  background: #ffeef0;
}

.error-text {
  color: #e11d48;
  font-size: 12px;
  margin-top: -5px;
  margin-bottom: 10px;
}

/* text-button 禁用狀態 */
.text-button[disabled] {
  color: #aaa !important; /* 灰色 */
  cursor: not-allowed !important;
  text-decoration: none !important; /* 移除底線 */
}

/* OTP輸入框樣式 */
.otp-container {
  position: relative;
  width: 100%;
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

/* 將真實輸入框隱藏，但不能用 display: none，否則 iOS 無法聚焦 */
.hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.01;         /* 透明但存在 */
  z-index: 10;        /* 確保在最上層 */
  cursor: text;
  border: none;       /* 移除邊框以免干擾佔位 */
}

/* 視覺格子組：確保它是橫向排列且佔滿寬度 */
.otp-visual-group {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: space-between;
  pointer-events: none; /* 讓點擊事件穿透到下層的 hidden-input，或者靠 z-index 處理 */
}

/* 單個視覺格子 */
.otp-input-visual {
  flex: 1;            /* 平分空間 */
  max-width: 45px;
  height: 55px;
  display: flex;      /* 關鍵：改為 flex 才能置中數字 */
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: white;
  transition: all 0.2s ease;
}

/* 啟動狀態（游標感） */
.otp-input-visual.is-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* .otp-input {
  width: 45px;
  height: 55px;
  text-align: center;
  font-size: 24px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.otp-input:focus {
  border-color: #3b82f6;
  outline: none;
} */

/* 手機響應式調整 */
@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 20px;
  }

  h1 {
    font-size: 28px;
    margin-bottom: 30px;
  }

  label, input, button {
    font-size: 18px;
  }
}
</style>