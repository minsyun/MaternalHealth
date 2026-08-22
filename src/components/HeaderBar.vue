<template>
  <header>
    <div class="title">孕產婦健康照護管理</div>

    <!-- 導覽列 -->
    <nav class="navbar">
      <router-link class="item" to="/">首頁</router-link>
      <router-link class="item" to="/prenatal-data">產檢資料專區</router-link>
      <!-- 帶有 dropdown 的衛教資訊專區 -->
      <div class="dropdown">
        <router-link class="item" to="/education">衛教資訊專區</router-link>
        <div class="dropdown-content">
          <router-link to="/education/pregnancy">孕期衛教資訊</router-link>
          <router-link to="/education/prenatal-checkup">產檢衛教資訊</router-link>
        </div>
      </div>
      <router-link class="item" to="/postpartum">產後專區</router-link>
      <router-link class="item" to="/self-assessment">自我評估專區</router-link>
      <router-link class="item" to="/timeline">孕育時光表</router-link>
    </nav>

    <!-- 通知icon & 個人資訊icon -->
    <div class="icons">
      <button class="icon-btn" @click="openNotification">
        <img class="icon-img" src="@/assets/notify.png" alt="Notification Icon">
      </button>
      <button class="icon-btn" @click="openUserPage">
        <img class="icon-img" src="@/assets/user.png" alt="User Icon">
      </button>
    </div>
  </header>
</template>

<script setup>
const openNotification = () => alert('打開通知頁面');
const openUserPage = () => alert('打開使用者頁面');
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 30px;
}
.title {
  font-size: 30px;
  color: #3498db;
  font-weight: 700;
}
.navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
.item {
  flex-grow: 1;
  padding: 20px;
  border-bottom: 5px solid transparent;
  transition: 0.2s;
  text-decoration: none;
  font-size: 22px;
  color: gray;
}
.item:hover {
  border-bottom: 5px solid gray;
}
.icons {
  display: flex;
  align-items: center;
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
}
.icon-img {
  width: 55px;
  height: 55px;
}
/* 點擊導覽列選項 */
.router-link-active {
  border-bottom: 5px solid #605f5f;
  color: #605f5f !important;
  font-weight: 600;
}
/* Dropdown 整體 */
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
.dropdown-content a:hover {
  background: #f0f0f0;
}
/* 滑鼠 hover 顯示下拉 */
.dropdown:hover .dropdown-content {
  display: block;
}

</style>
