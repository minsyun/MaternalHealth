<template>
  <div class="panel-footer">
    <button 
      class="btn-submit" 
      @click="$emit('submit')"
      :disabled="loading"
    >
      <slot>送出</slot>
    </button>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['submit']);
</script>

<style scoped>
.panel-footer {
  text-align: right;
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #cbd5e0;
}

.btn-submit {
  background-color: #5a6b7c;
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-submit:hover {
  background-color: #3498db;
}
</style>
