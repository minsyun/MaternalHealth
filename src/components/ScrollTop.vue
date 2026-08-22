<template>
  <button
    class="scroll-top-btn"
    :class="{ show: visible }"
    @click="scrollToTop"
  >
    ↑
  </button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const visible = ref(false);

// 偵測滾動高度
const scrollHandler = () => {
  visible.value = window.scrollY > 300; // 超過 300px 才顯示
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", scrollHandler);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", scrollHandler);
});
</script>

<style scoped>
.scroll-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: gray;
  color: white;
  font-size: 22px;
  cursor: pointer;
  z-index: 999;
  opacity: 0;           /* 預設透明 */
  visibility: hidden;   /* 預設不顯示 */
  transform: translateY(20px); /* 往下偏移 */
  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;
}

/* 出現狀態 */
.scroll-top-btn.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.scroll-top-btn:hover {
  background-color: rgb(176, 175, 175);
}
</style>
