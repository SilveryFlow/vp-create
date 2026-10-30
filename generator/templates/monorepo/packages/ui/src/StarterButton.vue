<script setup lang="ts">
defineProps<{ label: string }>()
const emit = defineEmits<{ activate: [] }>()
</script>

<template>
  <button type="button" @click="emit('activate')">{{ label }}</button>
</template>
