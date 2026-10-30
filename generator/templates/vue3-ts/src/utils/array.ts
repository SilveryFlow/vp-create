/**
 * 获取数组的循环切片
 * @param {Array} array 原数组
 * @param {number} start 起始索引
 * @param {number} count 获取数量
 * @returns {Array} 切片后的新数组
 */
export const getCyclinSlice = <T>(array: T[], start: number, count: number): T[] => {
  if (array.length <= count) {
    return array
  }
  const len = array.length
  const end = start + count
  if (end <= len) {
    return array.slice(start, end)
  } else {
    return [...array.slice(start), ...array.slice(0, end - len)]
  }
}
