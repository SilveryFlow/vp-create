import { expect, test } from '@playwright/test'
test('共享组件计数与路由切换正常', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('count')).toHaveText('当前计数：0')
  await page.getByRole('button', { name: '增加计数' }).click()
  await expect(page.getByTestId('count')).toHaveText('当前计数：1')
  await page.getByRole('link', { name: '关于' }).click()
  await expect(page).toHaveURL(/\/about$/)
  await page.reload()
  await expect(page.getByText('两个独立应用共用')).toBeVisible()
})
