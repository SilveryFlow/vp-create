import type { Directive, DirectiveBinding } from 'vue'

type FitTextEl = HTMLElement & {
  __resizeObserver__?: ResizeObserver
  __mutationObserver__?: MutationObserver
}

type FitTextBinding = DirectiveBinding<number | string | undefined>

const fit = (el: FitTextEl, binding: FitTextBinding) => {
  // 1. 获取配置的最大宽度
  // 如果指令传了值（例如 v-fit-text="300"），用传入的值
  // 否则使用父元素的宽度
  const maxWidth = Number(binding.value ?? el.parentElement?.clientWidth ?? 0)
  if (!maxWidth) return
  // 2. 预设必要样式，确保能正确测量
  // 必须不换行，且宽度由内容撑开，这样才能算出真实的 scrollWidth
  el.style.whiteSpace = 'nowrap'
  el.style.width = 'max-content'
  // 3. 先重置缩放，获取真实宽度
  el.style.scale = '1'
  // el.style.transformOrigin = 'center center' // 默认居中对齐缩放

  const realWidth = el.scrollWidth

  if (realWidth > maxWidth) {
    const scale = maxWidth / realWidth
    el.style.scale = String(scale)
  } else {
    el.style.scale = '1'
  }
}
/**
 * 内容超出指定宽度时，自动缩小
 */
export const fitText: Directive<FitTextEl, number | string | undefined> = {
  mounted(el: FitTextEl, binding: FitTextBinding) {
    fit(el, binding)
    // 监听字体加载完成（防止字体加载延迟导致宽度计算错误）
    document.fonts?.ready?.then(() => fit(el, binding))

    // 创建resizeObserver监听父容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      fit(el, binding)
    })
    if (el.parentElement) resizeObserver.observe(el.parentElement)

    // 创建mutationObserver监听文字内容变化
    const mutationObserver = new MutationObserver(() => {
      fit(el, binding)
    })
    mutationObserver.observe(el, {
      childList: true, // 监听子节点变动（如文本变化）
      characterData: true,
      subtree: true,
    })

    el.__resizeObserver__ = resizeObserver
    el.__mutationObserver__ = mutationObserver
  },

  // 组件更新时触发（应对 binding.value 变化）
  updated(el: FitTextEl, binding: FitTextBinding) {
    fit(el, binding)
  },

  beforeUnmount(el: FitTextEl) {
    el.__resizeObserver__?.disconnect()
    delete el.__resizeObserver__
    el.__mutationObserver__?.disconnect()
    delete el.__mutationObserver__
  },
}
