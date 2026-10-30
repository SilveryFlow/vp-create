/**
 * 防抖函数，在指定时间间隔内，如果再次触发，则重新计时
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  { delay = 200, immediate = true }: { delay?: number; immediate?: boolean } = {},
) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let isImmediate = immediate

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (isImmediate) {
      fn.apply(this, args)
      isImmediate = false
      return
    }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数，在指定时间间隔内，如果再次触发，则不执行
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  { delay = 200, immediate = true }: { delay?: number; immediate?: boolean } = {},
) {
  let isImmediate = immediate
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (isImmediate) {
      fn.apply(this, args)
      isImmediate = false
      return
    }
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 使用 requestAnimationFrame 实现的定时器
 */
export function rAFInterval(
  fn: () => void,
  { interval = 1000, immediate = false }: { interval?: number; immediate?: boolean } = {},
): () => void {
  let timer: number | null = null
  let lastTime = performance.now()
  let isStopped = false

  const loop = (timestamp: number) => {
    if (isStopped) return
    timer = requestAnimationFrame(loop)
    if (timestamp - lastTime >= interval) {
      lastTime = timestamp
      fn()
    }
  }

  if (immediate) {
    fn()
    lastTime = performance.now()
  }

  timer = requestAnimationFrame(loop)

  return () => {
    isStopped = true
    if (timer !== null) cancelAnimationFrame(timer)
  }
}
