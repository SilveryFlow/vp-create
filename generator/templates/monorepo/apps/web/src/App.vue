<script setup lang="ts">
import { shallowRef } from 'vue'
import { StarterButton } from '@starter/ui'
import { sum } from '@starter/utils'
const count = shallowRef(0)
</script>

<template>
  <main>
    <h1>Vue 3 + Vite+ Monorepo</h1>
    <StarterButton :label="'计数：' + count" @activate="count = sum(count, 1)" />
  </main>
</template>
