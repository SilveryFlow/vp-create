export const getTime = () => {
  const now = new Date()

  /* 年 */
  const year = now.getFullYear()
  /* 月 */
  const month = String(now.getMonth() + 1).padStart(2, '0') // 补零
  /* 日 */
  const date = String(now.getDate()).padStart(2, '0') // 补零
  /* 时 */
  const hours = String(now.getHours()).padStart(2, '0') // 补零
  /* 分 */
  const minutes = String(now.getMinutes()).padStart(2, '0') // 补零
  /* 秒 */
  const seconds = String(now.getSeconds()).padStart(2, '0') // 补零

  return {
    year,
    month,
    date,
    hours,
    minutes,
    seconds,
  }
}
