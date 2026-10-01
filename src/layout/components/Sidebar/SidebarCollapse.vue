<template>
  <Transition
    name="ry-collapse"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="resetStyle"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="resetStyle"
  >
    <div v-show="show">
      <slot />
    </div>
  </Transition>
</template>

<script setup lang="ts">
/**
 * 高度自适应的折叠动画容器（内联手风琴用）。
 *
 * 为什么不用 `grid-template-rows: 0fr → 1fr` 或 max-height：
 *   - grid 方案在旧版 Safari 上不生效；
 *   - max-height 需要猜一个上限，展开瞬间会有明显延迟或突跳。
 * 这里沿用 Element 官方 collapse-transition 的做法：进入/离开前把 height 设成
 * 0 / scrollHeight 再交给 CSS transition，动画结束时清掉行内样式，
 * 这样高度始终是内容真实高度，后续内容变化也不会被旧的固定高度卡住。
 */
defineOptions({ name: 'SidebarCollapse' })

defineProps<{
  /** 是否展开；收起时元素 display:none，内部链接不会被 tab 聚焦 */
  show: boolean
}>()

/** 清理动画期间的临时行内样式，把高度交还给内容本身 */
const resetStyle = (el: Element) => {
  const target = el as HTMLElement
  target.style.height = ''
  target.style.overflow = ''
}

const onBeforeEnter = (el: Element) => {
  const target = el as HTMLElement
  target.style.height = '0'
  target.style.overflow = 'hidden'
}

const onEnter = (el: Element) => {
  const target = el as HTMLElement
  target.style.height = `${target.scrollHeight}px`
}

const onBeforeLeave = (el: Element) => {
  const target = el as HTMLElement
  target.style.height = `${target.scrollHeight}px`
  target.style.overflow = 'hidden'
}

const onLeave = (el: Element) => {
  const target = el as HTMLElement
  target.style.height = '0'
}
</script>

<style scoped>
.ry-collapse-enter-active,
.ry-collapse-leave-active {
  overflow: hidden;
  transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .ry-collapse-enter-active,
  .ry-collapse-leave-active {
    transition: none;
  }
}
</style>
