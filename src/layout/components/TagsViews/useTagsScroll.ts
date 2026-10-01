import type { Ref } from 'vue'

/** 点一次箭头滚动多少像素 */
export const TAG_SCROLL_STEP = 200

/**
 * 标签栏横向滚动逻辑：
 * - 只有真正溢出（scrollWidth > clientWidth）才允许左右箭头出现；
 * - 箭头绝对定位、不占宽度，避免「出现箭头 → 容器变窄 → 更多溢出」的抖动；
 * - 滚动到两端时对应箭头自动隐藏/禁用；
 * - 提供滚轮横滚与「把指定标签滚进视野」。
 *
 * @param stripRef 横向滚动容器
 * @param watchSource 影响内容宽度的响应式来源（标签数量、当前路由等），变化后重新测量
 */
export function useTagsScroll(stripRef: Ref<HTMLElement | null>, watchSource: () => unknown) {
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  /** 重新测量溢出状态 */
  const update = (): void => {
    const el = stripRef.value
    if (!el) {
      canScrollLeft.value = false
      canScrollRight.value = false
      return
    }

    const maxScrollLeft = el.scrollWidth - el.clientWidth
    canScrollLeft.value = el.scrollLeft > 1
    canScrollRight.value = maxScrollLeft > 1 && el.scrollLeft < maxScrollLeft - 1
  }

  // 容器尺寸变化（窗口缩放、侧边栏折叠）后重新测量
  useResizeObserver(stripRef, update)

  // 滚动时同步两端状态
  useEventListener(stripRef, 'scroll', update, { passive: true })

  // 标签增删 / 切换路由后重新测量
  watch(watchSource, () => nextTick(update))

  onMounted(() => nextTick(update))

  /** 按像素左右滚动 */
  const scrollBy = (delta: number): void => {
    const el = stripRef.value
    if (!el) {
      return
    }
    el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
  }

  /**
   * 让指定标签完整可见。
   * 只调整容器的 scrollLeft（不用 scrollIntoView，避免连带滚动整个页面）。
   */
  const scrollTagIntoView = (path: string): void => {
    const el = stripRef.value
    const target = el?.querySelector<HTMLElement>(`[data-tag-path="${CSS.escape(path)}"]`)
    if (!el || !target) {
      return
    }

    const left = target.offsetLeft
    const right = left + target.offsetWidth
    const padding = 8

    if (left - padding < el.scrollLeft) {
      el.scrollTo({ left: Math.max(left - padding, 0), behavior: 'smooth' })
    } else if (right + padding > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: right + padding - el.clientWidth, behavior: 'smooth' })
    }
  }

  /** 滚轮转横向滚动：只有真的溢出时才拦截默认行为，否则保持页面正常滚动 */
  const onWheel = (event: WheelEvent): void => {
    const el = stripRef.value
    if (!el || el.scrollWidth <= el.clientWidth) {
      return
    }

    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    if (!delta) {
      return
    }

    event.preventDefault()
    el.scrollLeft += delta
  }

  return { canScrollLeft, canScrollRight, update, scrollBy, scrollTagIntoView, onWheel }
}
