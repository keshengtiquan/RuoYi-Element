import type { Ref } from 'vue'

/**
 * 判断一个「单行省略」元素的文字是否真的被截断了（`scrollWidth > clientWidth`）。
 *
 * 用途：让 tooltip **只在被截断时**才弹 —— 短标题不该无谓打扰用户，长标题仍能看到全称。
 * 元素必须已经带上 `truncate`（overflow: hidden + text-overflow: ellipsis + white-space: nowrap），
 * 否则 `scrollWidth` 不会超过 `clientWidth`，判断永远为 false。
 * 思路与 TagsViews 的溢出箭头一致（都是 scrollWidth vs clientWidth）。
 *
 * @param elRef 目标元素（文字所在的那个 span）
 * @param deps 会让文字或可用宽度变化的响应式来源（标题、折叠态、展开态等）
 */
export function useTextOverflow(elRef: Ref<HTMLElement | null>, deps: () => unknown) {
  const isOverflowing = ref(false)

  const update = (): void => {
    const el = elRef.value
    // +1 容差：部分缩放下 scrollWidth/clientWidth 会差 1px 取整
    isOverflowing.value = !!el && el.scrollWidth > el.clientWidth + 1
  }

  // 容器宽度变化（侧边栏折叠/展开、窗口缩放）
  useResizeObserver(elRef, update)
  // 文字内容变化
  watch(deps, () => nextTick(update))
  onMounted(() => nextTick(update))

  return { isOverflowing, update }
}
