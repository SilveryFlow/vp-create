import { mount } from '@vue/test-utils'
import { expect, test } from 'vite-plus/test'
import StarterButton from '../StarterButton.vue'
test('点击按钮通过事件通知父组件', async () => {
  const wrapper = mount(StarterButton, { props: { label: '增加' } })
  await wrapper.trigger('click')
  expect(wrapper.emitted('activate')).toHaveLength(1)
})
test('禁用时不发出操作事件', async () => {
  const wrapper = mount(StarterButton, { props: { label: '增加', disabled: true } })
  await wrapper.trigger('click')
  expect(wrapper.emitted('activate')).toBeUndefined()
})
