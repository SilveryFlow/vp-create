import { createPinia, setActivePinia } from 'pinia'
import { expect, test } from 'vite-plus/test'
import { useCounterStore } from '../counter'
test('每次操作通过共享工具库增加计数', () => {
  setActivePinia(createPinia())
  const store = useCounterStore()
  store.increment()
  expect(store.count).toBe(1)
})
