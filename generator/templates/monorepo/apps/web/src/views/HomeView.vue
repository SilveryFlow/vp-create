<script setup lang="ts">
import { StarterButton } from '@starter/ui'
import { useCounterStore } from '../stores/counter'
const counter = useCounterStore()
</script>

<template>
  <el-card>
    <h2>共享组件与工具库</h2>
    <p data-testid="count">当前计数：{{ counter.count }}</p>
    <StarterButton label="增加计数" @activate="counter.increment" />
  </el-card>
</template>
