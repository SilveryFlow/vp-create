/**
 * 为数字添加千分位分隔符
 * @param {number} num
 * @returns {string}
 */
export const formatWithThousands = (num: number): string => num.toLocaleString('en-US')

/**
 * 最多保留两位小数
 * @param {number} value
 */
export const toTwoDecimals = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return num.toFixed(2)
}

/**
 * 判断数组有几位小数
 * @param {number} num
 * @returns {number}
 */
export const decimalPlaces = (num: number): number => {
  return num.toString().split('.')[1]?.length ?? 0
}

/**
 *  转化为千分位，并最多保留两位小数
 * @param {*} value
 * @returns
 */
export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  if (decimalPlaces(num) > 2) {
    return formatWithThousands(Number(num.toFixed(2)))
  }
  return formatWithThousands(num)
}

/**
 * 小数化为百分比，最多保留两位小数
 * @param {*} value
 * @returns
 */
export const formatPercent = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '-'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  const pct = num * 100
  const result = Number.parseFloat(pct.toFixed(2))
  return `${result}%`
}

/**
 * 获取环比值
 * @param {number} value 第一个值
 * @param {number} base 第二个值
 * @returns {number} 环比值
 */
export const getRelativeChange = (
  value: number | string | null | undefined,
  base: number | string | null | undefined,
) => {
  if (value === null || value === undefined || value === '') return '-'
  if (base === null || base === undefined || base === '') return '-'
  const numA = Number(value)
  const numB = Number(base)
  if (Number.isNaN(numA)) return String(value)
  if (Number.isNaN(numB)) return String(base)
  if (numB === 0) {
    return 0
  }
  const result = (numA - numB) / numB
  return Number.parseFloat(result.toFixed(4))
}
