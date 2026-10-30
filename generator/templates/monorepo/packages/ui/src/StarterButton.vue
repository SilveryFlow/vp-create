<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean }>()
const emit = defineEmits<{ activate: [] }>()
</script>

<template>
  <button class="starter-button" type="button" :disabled="disabled" @click="emit('activate')">
    {{ label }}
  </button>
</template>

<style scoped>
.starter-button {
  padding: 8px 16px;
  color: #fff;
  cursor: pointer;
  background: #2563eb;
  border: 1px solid #2563eb;
  border-radius: 6px;
}
.starter-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
