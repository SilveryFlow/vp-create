/**
 * 将type-a或type_a格式的字符串转换为小驼峰命名: typeA
 * @param {string} str
 * @returns {string}
 */
export const toCamelCase = (str: string): string => {
  return str.toLowerCase().replace(/[-_](.)/g, (_, c) => c.toUpperCase());
};

export interface DateInfo {
  /* 日期对象 */
  dateObj: Date;
  /* 年份 */
  year: number;
  /* 月份 */
  month: number;
  /* 日期 */
  day: number;
}
/**
 * 把xxx年xxx月xxx日的字符串转为日期对象
 * @param {string} str - "2025年12月25日" 格式的日期字符串
 * @returns {DateInfo|null} 包含日期对象和年月日的结构对象,如果格式不匹配则返回 null
 */
export const stringToDate = (str: string): DateInfo | null => {
  if (!str || typeof str !== "string") return null;
  const match = str.match(/(\d+)年(\d+)月(\d+)日/);
  if (!match) return null;
  const [, year, month, day] = match;
  return {
    dateObj: new Date(+year!, +month! - 1, +day!),
    year: +year!,
    month: +month!,
    day: +day!,
  };
};
