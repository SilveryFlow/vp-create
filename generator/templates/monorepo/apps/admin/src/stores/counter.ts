import { shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { sum } from '@starter/utils'
export const useCounterStore = defineStore('counter', () => {
  const count = shallowRef(0)
  const increment = () => {
    count.value = sum(count.value, 1)
  }
  return { count, increment }
})
