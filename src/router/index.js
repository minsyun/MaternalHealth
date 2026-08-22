// 控制路由導航，定義各個頁面對應的路徑和元件
import { createRouter, createWebHashHistory } from "vue-router";
import login from "../views/login.vue";
import home from "../views/home.vue";
import profile from "../views/profile.vue";
import prenatal from "../views/prenatal.vue";
import PregnancyDiary from "../views/PregnancyDiary.vue";
import Education from "../views/Education.vue";
import EducationPregnancy from "../views/EducationPregnancy.vue";
import EducationPrenatalCheckup from "../views/EducationPrenatalCheckup.vue";
import Postpartum from "../views/Postpartum.vue";
import SelfAssessment from "../views/SelfAssessment.vue";
import AssessmentInstructions from "../views/AssessmentInstructions.vue";
import AssessmentPrenatal from "../views/AssessmentPrenatal.vue";
import AssessmentDepression from "../views/AssessmentDepression.vue";
import AssessmentHistory from "../views/AssessmentHistory.vue";
import AssessmentHistoryDetail from "../views/AssessmentHistoryDetail.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: login, // ← 預設載入 Login
  },
  {
    path: "/home",
    name: "home",
    component: home,
  },
  {
    path: "/profile",
    name: "profile",
    component: profile,
  },
  {
    path: "/prenatal",
    name: "prenatal",
    component: prenatal,
  },
  {
    path: "/Calendar-Diary",
    name: "PregnancyDiary",
    component: PregnancyDiary,
  },
  { 
    path: "/education", 
    name: "Education", 
    component: Education 
  },
  {
    path: "/education/pregnancy",
    name: "EducationPregnancy",
    component: EducationPregnancy,
  },
  {
    path: "/education/prenatal-checkup",
    name: "EducationPrenatalCheckup",
    component: EducationPrenatalCheckup,
  },
  { 
    path: "/postpartum", 
    name: "Postpartum", 
    component: Postpartum 
  },
  {
    path: "/self-assessment",
    component: SelfAssessment,
    children: [
      // 預設路徑導向說明頁
      { path: "", redirect: "/self-assessment/instructions" },
      { path: "instructions", component: AssessmentInstructions },
      { path: "prenatal", component: AssessmentPrenatal },
      { path: "depression", component: AssessmentDepression },
      { path: "history", component: AssessmentHistory },
      { path: "history/:id", component: AssessmentHistoryDetail, props: true }, // 允許將 id 作為 props 傳入元件
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory('/MaternalHealthManagementSystem/'), //加入儲存庫名稱
  routes,
});

//登入後才可以訪問其他頁面，否則導回登入頁
router.beforeEach((to, from) => {
  // 1. 取得並解析使用者資料
  let user = null;
  try {
    const userStr = sessionStorage.getItem('user');
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  // 2. 核心登入判斷
  const isLoggedIn = !!(user && user.user_id);
  
  // 3. 判斷目標路徑是否為登入頁
  const isGoingToLogin = to.path === '/' || to.name === 'login';

  console.log(`[Router Guard] Path: ${to.path}, LoggedIn: ${isLoggedIn}`);

  // --- 開始判斷邏輯，使用 return 取代 next() ---

  if (!isLoggedIn && !isGoingToLogin) {
    // 情況 A：未登入且要去保護頁面 -> 重定向至登入頁
    console.warn("未偵測到登入資訊，重定向至登入頁");
    return { name: 'login' }; 
  } 
  
  if (isLoggedIn && isGoingToLogin) {
    // 情況 B：已登入但想去登入頁 -> 強制去首頁
    console.log("已登入，自動跳轉至首頁");
    return { name: 'home' };
  }

  // 情況 C：其他正常情況 -> 直接 return (不 return 任何東西即代表放行)
  // 在 Vue Router 4 中，不 return 或是 return true 就是允許導航
});

export default router;