import { expect, test } from 'vite-plus/test'
import { sum } from '../index'
test('支持正数和负数求和', () => {
  expect(sum(-2, 1)).toBe(-1)
  expect(sum(2, 3)).toBe(5)
})
