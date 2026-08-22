<template>
  <div class="profile-container">
    <h1 class="title">個人資訊</h1>
    <div class="content-grid">
      <div class="left-panel">
        <div class="avatar-section">
          <div class="avatar-placeholder" @click="triggerFileInput">
            <img
              v-if="profileData.user_file_path"
              :src="profileData.user_file_path" 
              class="avatar-img"
              alt="avatar"
            />

            <i v-else class="fi fi-sr-picture"></i>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              style="display: none"
            />
          </div>

          <div class="avatar-text">點擊上傳頭像</div>
        </div>
        <div class="due-date-card">
          <label for="dueDate">預產期</label>
          <input
            id="dueDate"
            type="text"
            v-model="profileData.dueDate"
            placeholder="YYYY/MM/DD"
            class="input-field"
            readonly
          />
          <p v-if="errors.dueDate" class="error-msg">{{ errors.dueDate }}</p>
        </div>
      </div>
      <div class="right-panel">
        <div class="form-group-half">
          <div class="field-item">
            <label for="name">姓名</label>
            <input
              id="name"
              type="text"
              v-model="profileData.name"
              class="input-field"
              :class="{ 'input-error': errors.name }"
            />
            <p v-if="errors.name" class="error-msg">
              {{ errors.name }}
            </p>
          </div>
          <div class="field-item">
            <label for="dobpicker">出生年月日</label>
            <input
              id="dobpicker"
              type="date"
              v-model="profileData.dob"
              placeholder="YYYY-MM-DD"
              class="input-field"
              :class="{ 'input-error': errors.dob }"
              max="2025-12-24"
            />
            <p v-if="errors.dob" class="error-msg">{{ errors.dob }}</p>
          </div>
        </div>
        <div class="form-group-half">
          <div class="field-item">
            <label for="mobile">手機號碼</label>
            <input
              id="mobile"
              type="text"
              v-model="profileData.mobile"
              class="input-field"
              :class="{ 'input-error': errors.mobile }"
            />
            <p v-if="errors.mobile" class="error-msg">{{ errors.mobile }}</p>
          </div>
          <div class="field-item">
            <label for="bloodTypeSelect">血型</label>
            <select
              id="bloodTypeSelect"
              v-model="profileData.bloodType"
              class="select-field"
              :class="{ 'input-error': errors.bloodType }"
            >
              <option value="" disabled>請選擇血型</option>
              <option v-for="type in bloodTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
            <p v-if="errors.bloodType" class="error-msg">
              {{ errors.bloodType }}
            </p>
          </div>
        </div>
        <div class="form-group-half">
          <div class="field-item">
            <label for="landline">聯絡電話(市話)</label>
            <input
              id="landline"
              type="text"
              v-model="profileData.landline"
              class="input-field"
              :class="{ 'input-error': errors.landline }"
            />
            <p v-if="errors.landline" class="error-msg">
              {{ errors.landline }}
            </p>
          </div>
          <div class="field-item">
            <label for="height">身高(公分)</label>
            <input
              id="height"
              type="text"
              placeholder="單位:公分"
              v-model="profileData.height"
              class="input-field"
              :class="{ 'input-error': errors.height }"
            />
            <p v-if="errors.height" class="error-msg">{{ errors.height }}</p>
          </div>
        </div>
        <div class="form-group-half">
          <div class="field-item">
            <label for="email">電子郵件</label>
            <input
              id="email"
              type="email"
              v-model="profileData.email"
              class="input-field"
              :class="{ 'input-error': errors.email }"
            />
            <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
          </div>
          <div class="field-item">
            <label for="weight">體重(公斤)</label>
            <input
              id="weight"
              type="text"
              placeholder="單位:公斤"
              v-model="profileData.weight"
              class="input-field"
              :class="{ 'input-error': errors.weight }"/>
            <p v-if="errors.weight" class="error-msg">{{ errors.weight }}</p>
          </div>
        </div>
        <div class="form-group-full">
          <div class="field-item">
            <label for="address"> 地址 </label>
            <input
              id="address"
              type="text"
              v-model="profileData.address"
              placeholder="請輸入地址"
              class="input-field"
            />
          </div>
        </div>

        <h3 class="emergency-title">緊急聯絡人資料</h3>
        <div class="form-group-full">
          <div class="field-item">
            <label for="emergencyContact">姓名</label>
            <input
              id="emergencyContact"
              type="text"
              v-model="profileData.emergencyContact"
              placeholder="緊急聯絡人姓名"
              class="input-field"
              :class="{ 'input-error': errors.emergencyContact }"
            />
            <p v-if="errors.emergencyContact" class="error-msg">
              {{ errors.emergencyContact }}
            </p>
          </div>
        </div>
        <div class="form-group-full">
          <div class="field-item">
            <label for="emergencyRelation">關係</label>
            <input
              id="emergencyRelation"
              type="text"
              v-model="profileData.emergencyRelation"
              placeholder="與緊急聯絡人關係"
              class="input-field"
              :class="{ 'input-error': errors.emergencyRelation }"
            />
            <p v-if="errors.emergencyRelation" class="error-msg">
              {{ errors.emergencyRelation }}
            </p>
          </div>
        </div>
        <div class="form-group-full">
          <div class="field-item">
            <label for="emergencyPhone">手機電話</label>
            <input
              id="emergencyPhone"
              type="text"
              v-model="profileData.emergencyPhone"
              placeholder="緊急聯絡人手機電話"
              class="input-field"
              :class="{ 'input-error': errors.emergencyPhone }"
            />
            <p v-if="errors.emergencyPhone" class="error-msg">
              {{ errors.emergencyPhone }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="action-buttons">
      <button class="btn btn-backbtn" @click="backbtn">返回上一頁</button>
      <button class="btn btn-clean" @click="clean">清除輸入</button>
      <button class="btn btn-save" @click="saveProfile">儲存</button>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api.js";
import dayjs from "dayjs";

const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL;
console.log(import.meta.env.VITE_CLOUDINARY_BASE_URL);


const router = useRouter();

const profileData = reactive({
  name: "",
  mobile: "",
  landline: "",
  email: "",
  emergencyContact: "",
  emergencyRelation: "",
  emergencyPhone: "",
  dob: "",
  bloodType: "",
  height: "",
  weight: "",
  dueDate: "",
  address: "",
  user_file_path: "",
});

const bloodTypes = ["A型", "B型", "AB型", "O型", "Rh-型", "未知"];
const errors = reactive({});


// profile.vue 內的同步邏輯
const syncToStorage = () => {
  const existingUser = JSON.parse(sessionStorage.getItem("user")) || {};

  const syncedUser = {
    ...existingUser,
    name: profileData.name,
    email: profileData.email,
    user_file_path: profileData.user_file_path
  };

  sessionStorage.setItem("user", JSON.stringify(syncedUser));
  window.dispatchEvent(new Event("user-data-updated"));
};

// onMounted 載入資料並修正格式
// profile.vue
onMounted(async () => {
  const loginUser = JSON.parse(sessionStorage.getItem("user"));
  if (!loginUser || !loginUser.user_id) return;

  try {
    const res = await api.get("/api/profile/");
    if (res.data) {
      const db = res.data;
      
      // 賦值給表單
      profileData.name = db.name;
      profileData.mobile = db.phone_number;
      profileData.landline = db.landline;
      profileData.email = db.email || ""; // 這裡抓到了資料庫的 email
      profileData.address = db.address;
      profileData.height = db.height;
      profileData.weight = db.weight;
      profileData.user_file_path = db.user_file_path || ""; // 這裡抓到了資料庫的頭像路徑

      profileData.emergencyContact = db.ice_name;
      profileData.emergencyRelation = db.ice_relationship;
      profileData.emergencyPhone = db.ice_phone_number;
      profileData.bloodType = db.blood_type ? `${db.blood_type}型` : "";
      profileData.dob = db.birthday ? dayjs(db.birthday).format("YYYY-MM-DD") : "";
      profileData.dueDate = db.edc ? dayjs(db.edc).format("YYYY-MM-DD") : "未設定";

      // 修正：在這裡執行同步，確保 sessionStorage 裡的 user 物件含有 email
      syncToStorage();
    }
  } catch (error) {
    console.error("載入失敗:", error);
  }
});

// 防呆機制
const validateProfile = () => {
  let valid = true;
  // 清空舊錯誤
  Object.keys(errors).forEach((k) => (errors[k] = ""));

  // ----------------------------- // 姓名(必填) // -----------------------------
  if (!profileData.name || !profileData.name.trim()) {
    errors.name = "姓名不可空白";
    valid = false;
  } else if (!/^[\u4E00-\u9FA5A-Za-z\s]{1,30}$/.test(profileData.name)) {
    errors.name = "姓名僅能包含中文或英文";
    valid = false;
  }

  // ----------------------------- // 出生年月日(必填 + 格式 + 不可未來) // -----------------------------
  const dobPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!profileData.dob) {
    errors.dob = "出生年月日不可空白";
    valid = false;
  } else if (!dobPattern.test(profileData.dob)) {
    errors.dob = "生日格式須為 YYYY-MM-DD";
    valid = false;
  } else {
    const today = new Date();
    const dob = new Date(profileData.dob);
    if (dob > today) {
      errors.dob = "生日不可晚於今天";
      valid = false;
    }
  }

  // ----------------------------- // 手機號碼(必填、09 開頭 + 8 碼) // -----------------------------
  const mobilePattern = /^09\d{8}$/;
  // 清除非數字字元 (例如:空格、破折號等)
  const mobileInput = profileData.mobile
    ? profileData.mobile.replace(/\D/g, "")
    : "";

  if (!profileData.mobile || !profileData.mobile.trim()) {
    errors.mobile = "手機不可空白";
    valid = false;
  } else if (!mobilePattern.test(mobileInput)) {
    errors.mobile = "手機格式錯誤(09 開頭,共 10 位數字)";
    valid = false;
  }

  // ----------------------------- // 血型(必填) // -----------------------------
  if (!profileData.bloodType) {
    errors.bloodType = "請選擇血型";
    valid = false;
  }

  // ----------------------------- // 市話(選填:0X-XXXXXXX) // -----------------------------
  if (profileData.landline) {
    // 移除空白和破折號,以檢查純數字長度 (更穩健的格式檢查)
    const landlineStripped = profileData.landline.replace(/[-\s]/g, "");
    // 檢查格式:0區碼-電話號碼
    const landlinePattern = /^0\d{1,2}-?\d{6,8}$/;
    if (!landlinePattern.test(profileData.landline.trim())) {
      errors.landline = "市話格式不正確(區碼 + 電話號碼,例如:02-12345678)";
      valid = false;
    }
  }

  // ----------------------------- // Email(選填:需符合 Email 格式) // -----------------------------
  if (profileData.email) {
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(profileData.email.trim())) {
      errors.email = "Email 格式不正確";
      valid = false;
    }
  }

  // ----------------------------- // 身高(選填:120–220) // -----------------------------
  if (profileData.height) {
    const h = Number(profileData.height);
    if (isNaN(h) || h < 120 || h > 220) {
      errors.height = "身高需介於 120〜220 公分";
      valid = false;
    }
  }

  // ----------------------------- // 體重(選填:30–200) // -----------------------------
  if (profileData.weight) {
    const w = Number(profileData.weight);
    if (isNaN(w) || w < 30 || w > 200) {
      errors.weight = "體重需介於 30〜200 公斤";
      valid = false;
    }
  }
  // ----------------------------- // 地址 // -----------------------------
  // 地址目前不做驗證

  // ----------------------------- // 緊急聯絡人姓名(必填) // -----------------------------
  if (!profileData.emergencyContact || !profileData.emergencyContact.trim()) {
    errors.emergencyContact = "緊急聯絡人姓名不可空白";
    valid = false;
  } else if (
    !/^[\u4E00-\u9FA5A-Za-z\s]{1,30}$/.test(profileData.emergencyContact)
  ) {
    errors.emergencyContact = "姓名僅能包含中文或英文";
    valid = false;
  }

  // ----------------------------- // 緊急聯絡人關係(必填) // -----------------------------
  if (!profileData.emergencyRelation || !profileData.emergencyRelation.trim()) {
    errors.emergencyRelation = "請填寫關係(例如:父、母、配偶)";
    valid = false;
  }

  // ----------------------------- // 緊急聯絡人手機(必填) // -----------------------------
  // 清除非數字字元
  const emergencyPhoneInput = profileData.emergencyPhone
    ? profileData.emergencyPhone.replace(/\D/g, "")
    : "";

  if (!profileData.emergencyPhone) {
    errors.emergencyPhone = "緊急聯絡人手機不可空白";
    valid = false;
  } else if (!mobilePattern.test(emergencyPhoneInput)) {
    errors.emergencyPhone = "緊急聯絡人手機格式錯誤(09 開頭,共 10 位數字)";
    valid = false;
  }

  return valid;
};

// 儲存前統一格式
// profile.vue

const saveProfile = async () => {
  if (!validateProfile()) {
    customAlert("資料格式有誤，請檢查！");
    return;
  }
  const loading = showLoading("個人資料儲存中..."); // 開啟 Loading

  try {
    const loginUser = JSON.parse(sessionStorage.getItem("user"));
    const payload = {
      name: profileData.name,
      edc: profileData.dueDate === "未設定" ? null : profileData.dueDate,
      birthday: profileData.dob,
      phone_number: profileData.mobile,
      landline: profileData.landline,
      email: profileData.email, 
      address: profileData.address,
      ice_name: profileData.emergencyContact,
      ice_relationship: profileData.emergencyRelation,
      ice_phone_number: profileData.emergencyPhone,
      blood_type: profileData.bloodType.replace("型", ""),
      height: profileData.height ? Number(profileData.height) : null,
      weight: profileData.weight ? Number(profileData.weight) : null,
      user_file_path: profileData.user_file_path,
    };

    const res = await api.put(`/api/profile/${loginUser.user_id}`, payload);

    if (res.data.success) {
      if (res.data.imageUrl) profileData.user_file_path = res.data.imageUrl;
      // customAlert("儲存中請稍候..."); 
      syncToStorage();
      
      customAlert("🎉 個人資料已成功儲存！");
    }
  } catch (error) { 

    customAlert("儲存失敗");

  }finally {
    loading.close(); // 關閉 Loading
  }
};

const backbtn = () => router.back();
const clean = () => {
  // 定義不需要被清除的欄位的key
  const keepFields = ["dueDate", "user_file_path"];

  Object.keys(profileData).forEach((k) => {
    // 只有當 key 不在排除名單內時，才執行清除
    if (!keepFields.includes(k)) {
      profileData[k] = "";
    }
  });
  
  // 同時清空錯誤訊息提示
  Object.keys(errors).forEach((k) => (errors[k] = ""));
};



// 上傳照片頭貼
const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const loginUser = JSON.parse(sessionStorage.getItem("user")); // 取得當前使用者 ID
  const loading = showLoading("圖片上傳中，請稍候..."); // 開啟 Loading

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;

    try {
      const res = await api.post("/api/upload-avatar", {
        image: base64, // 對應後端解構的 { image }
        user_id: loginUser.user_id // 對應後端解構的 { user_id }
      });

      if (res.data.imageUrl) {
        // 核心：將後端回傳的 Cloudinary 網址存入變數
        profileData.user_file_path = `${res.data.imageUrl}?t=${new Date().getTime()}`;
        customAlert("頭像已同步至雲端");
      }
    } catch (err) {
      console.error("上傳失敗:", err);
      customAlert("圖片上傳失敗");
    }finally {
      loading.close(); // 關閉 Loading
      event.target.value = ""; // 清空 input 讓同一張圖可以重複選取
    }
  };

  reader.readAsDataURL(file);
};

//---------------------
//      自定義視窗
//---------------------

// 自定義提示視窗
const customAlert = (message) => {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 25px rgba(0,0,0,0.2);
    z-index: 9999;
    text-align: center;
    font-size: 16px;
  `;

  modal.innerHTML = `
    <p style="margin-bottom: 15px; font-weight: 600;">${message}</p>
    <button id="alert-ok-btn" 
      style="padding: 8px 16px; background:#667eea; color:white; border:none; border-radius:6px; cursor:pointer;">
      確定
    </button>
  `;

  document.body.appendChild(modal);

  document.getElementById("alert-ok-btn").onclick = () => {
    modal.remove();
  };
};

// 自定義提示與載入視窗
const showLoading = (message = "處理中，請稍候...") => {
  const mask = document.createElement("div");
  mask.id = "loading-mask";
  mask.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex; justify-content: center; align-items: center;
    z-index: 10000;
  `;

  const loader = document.createElement("div");
  loader.style.cssText = `
    background: white;
    padding: 25px 40px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    text-align: center;
    display: flex; flex-direction: column; align-items: center;
    gap: 15px;
  `;

  // 加上一個簡單的旋轉動畫 CSS
  const spinnerStyle = document.createElement("style");
  spinnerStyle.innerHTML = `
    .spinner {
      width: 30px; height: 30px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #57aee2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(spinnerStyle);

  loader.innerHTML = `
    <div class="spinner"></div>
    <p style="margin: 0; font-weight: 600; color: #333;">${message}</p>
  `;

  mask.appendChild(loader);
  document.body.appendChild(mask);

  return {
    close: () => mask.remove()
  };
};
</script>

<style scoped>
/* 頁面容器 */
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f7f9fc;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  min-height: 80vh;
} /* 標題 */
.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #3e4c59; /* 深灰色,與 App.vue 的主色調搭配 */
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 3px solid #006aa8; /* 主題色下劃線 */
  display: inline-block;
} /* 緊急聯絡人標題 */
.emergency-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #006aa8;
  margin-top: 25px;
  margin-bottom: 15px;
  padding-left: 5px;
  border-left: 4px solid #006aa8;
} /* 主內容網格佈局 */
.content-grid {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
} /* 左側欄位 */
.left-panel {
  flex: 0 0 300px; /* 固定寬度,保持圖片結構 */
  display: flex;
  flex-direction: column;
  gap: 20px;
} /* 右側欄位 */
.right-panel {
  flex: 1;
} /* 頭像區 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}
.avatar-placeholder {
  width: 200px;
  height: 200px;
  background-color: #e6eaf0; /* 淡灰色背景 */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border: 1px solid #ccd2da;
  cursor: pointer;
  transition: background-color 0.3s;
}
.avatar-placeholder:hover {
  background-color: #dee2e6;
}
.avatar-placeholder i {
  font-size: 4rem;
  color: #a0aec0;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.avatar-text {
  font-size: 0.9rem;
  color: #6b7a8c;
} /* 預產期卡片 */
.due-date-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #006aa8;
}
.due-date-card label {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #49555f;
  margin-bottom: 10px;
}
 /* 表單群組 (左右兩欄) */
.form-group-half {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
} /* 表單群組 (滿版) */
.form-group-full {
  margin-bottom: 15px;
}
.field-item {
  flex: 1;
}
.field-item label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7a8c;
  margin-bottom: 5px;
}
.input-field {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05); /* 只有 input 需要內陰影 */
  transition: border-color 0.3s, box-shadow 0.3s;
}
.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  outline: none;
}
/* 唯讀欄位樣式 */
.input-field[readonly] {
  background-color: #f0f2f5;
  cursor: not-allowed;
  color: #888;
}
 /* 底部操作按鈕 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding-top: 25px;
  border-top: 1px solid #e0e4eb;
}
.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.btn-backbtn {
  background-color: #e63946;
  color: white;
}
.btn-backbtn:hover {
  background-color: #d62839;
  transform: translateY(-2px);
}
.btn-clean {
  background-color: #ffffff;
  color: #6b7a8c;
  border: 1px solid #ccd2da;
  box-shadow: none;
}
.btn-clean:hover {
  background-color: #f0f4f8;
  color: #49555f;
}
.btn-save {
  background-color: #57aee2;
  color: white;
}
.btn-save:hover {
  background-color: #006aa8;
  transform: translateY(-2px);
}
.error-msg {
  color: #e63946;
  font-size: 0.85rem;
  margin-top: 4px;
}

.input-field,
.select-field {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ccd2da;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  box-sizing: border-box;
}
.select-field {
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2349555f%22%20d%3D%22M287%2064.6l-138.8%20139c-3.7%203.7-9.8%203.7-13.5%200L4.7%2064.6c-3.7-3.7-3.7-9.8%200-13.5l13.5-13.5c3.7-3.7%209.8-3.7%2013.5%200l111.8%20111.8%20111.8-111.8c3.7-3.7%209.8-3.7%2013.5%200l13.5%2013.5c3.7%203.6%203.7%209.8%200%2013.5z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat, repeat;
  background-position: right .7em top 50%, 0 0;
  background-size: .65em auto, 100%;
}

/* 欄位紅框 */
.input-error {
  border-color: #e63946 !important;
  box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.25);


}
/*RWD*/
/* =========================================================
📱📱📱 完整優化版 RWD for profile.vue
========================================================= */
/* =============================
 🔵 平板（max-width: 900px）
  ============================= */
@media (max-width: 900px) {
  /* 整體改為單欄 */
  .content-grid {
    flex-direction: column;
    gap: 25px;
  } /* 左側區塊滿寬 */
  .left-panel {
    width: 100%;
    align-items: center;
  } /* 頭像置中＆縮小 */
  .avatar-placeholder {
    width: 160px;
    height: 160px;
  }
  .avatar-placeholder i {
    font-size: 3rem;
  } /* 預產期卡片 */
  .due-date-card {
    width: 100%;
    max-width: 500px;
  } /* 右側表單區域滿寬 */
  .right-panel {
    width: 100%;
  } /* 欄位改為單欄堆疊 */
  .form-group-half {
    flex-direction: column;
    gap: 10px;
  } /* 補齊欄位寬度一致 */
  .input-field,
  .select-field {
    width: 100% !important;
  }
}

/* =============================
🔵 小型手機（max-width: 600px）
============================= */
@media (max-width: 600px) {
  /* 容器縮邊距 */
  .profile-container {
    padding: 18px;
  } /* 標題縮小 */
  .title {
    font-size: 1.6rem;
    margin-bottom: 15px;
  } /* 頭像更小，符合手機尺寸 */
  .avatar-placeholder {
    width: 140px;
    height: 140px;
  }
  .avatar-text {
    font-size: 0.85rem;
  } /* 預產期卡片也縮小內距 */
  .due-date-card {
    padding: 16px;
  } /* 表單欄位字體放大更易點擊 */
  .input-field,
  .select-field {
    font-size: 1rem;
    padding: 12px 14px;
  } /* 標籤字體加大 */
  .field-item label {
    font-size: 0.95rem;
  } /* 緊急聯絡人標題 */
  .emergency-title {
    font-size: 1rem;
  } /* 按鈕改成滿版 */
  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }
  .btn {
    width: 100%;
    padding: 14px;
    font-size: 1rem;
  }
}

/* ==================================
🔵 超小螢幕（max-width: 420px）
 ================================== */
@media (max-width: 420px) {
  /* 頭像更小，避免佔太大 */
  .avatar-placeholder {
    width: 120px;
    height: 120px;
  }
  .avatar-placeholder i {
    font-size: 2.5rem;
  } /* 標題更小以免換行 */
  .title {
    font-size: 1.45rem;
  } /* 卡片左右補強 */
  .due-date-card {
    padding: 14px;
  }
  .input-field,
  .select-field {
    font-size: 1rem;
    padding: 12px 14px;
  }
}
</style>