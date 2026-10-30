import { expect, test } from 'vite-plus/test'
import { sum } from './index'

test('支持负数相加', () => {
  expect(sum(-2, 1)).toBe(-1)
})
