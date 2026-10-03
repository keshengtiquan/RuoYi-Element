<template>
  <IconButton
    :size="16"
    :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    @click="handleToggle"
  >
    <AppIcon :name="isDark ? 'moon' : 'sun'" />
  </IconButton>
</template>

<script setup lang="ts">
import IconButton from '@/components/IconButon/index.vue'
import AppIcon from '@/components/AppIcon/index.vue'

defineOptions({ name: 'ThemeToggle' })

/** 圆形揭示动画时长（ms） */
const REVEAL_DURATION = 420

/** 暗色主题挂在 <html> 上的类名（Element Plus 暗色变量按 .dark 生效） */
const DARK_CLASS = 'dark'

/**
 * 颜色模式：跟随系统（auto）→ 用户点过之后就按用户选的来，并持久化到 localStorage。
 * attribute: 'class' + modes 把 dark/light 映射成 <html> 上的 class（Element Plus 的暗色变量依赖它）。
 * mode 取到的是**解析后**的值，永远是 'dark' | 'light'，不会出现 'auto'。
 */
const mode = useColorMode({
  attribute: 'class',
  modes: {
    dark: DARK_CLASS,
    light: ''
  }
})

const isDark = computed(() => mode.value === 'dark')

/** 用户是否在系统里关掉了动画（无障碍） */
const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 切换暗黑模式。
 *
 * 支持 View Transitions API 时用「圆形揭示」做动画，圆心就是点击的按钮：
 * - 切到暗色：新视图（暗）的圆从 0 扩散到覆盖全屏 —— 从按钮那里扩散变黑；
 * - 切回亮色：旧视图（暗）的圆从覆盖全屏收缩回按钮 —— 收缩至按钮，露出下面的亮色。
 * 两者的层级关系在下面的 <style> 里显式指定，不依赖浏览器默认顺序。
 *
 * 不支持该 API（或用户偏好减少动画）时直接切换，不做动画。
 */
const handleToggle = (event: MouseEvent) => {
  const next = !isDark.value

  const applyMode = (): void => {
    mode.value = next ? 'dark' : 'light'
    /**
     * 同步把 class 落到 <html> 上。
     * useColorMode 内部是 `watch(state, onChanged, { flush: 'post' })`，
     * 而 View Transition 的「切换后」快照可能早于 post 队列；显式同步一次更稳妥，
     * 也让「快照拍到的是新主题」这件事不依赖队列时序（重复设置是幂等的）。
     */
    document.documentElement.classList.toggle(DARK_CLASS, next)
  }

  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
    applyMode()
    return
  }

  const x = event.clientX
  const y = event.clientY
  // 圆心到视口最远角的距离：保证这个圆一定能盖住整屏
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  const transition = document.startViewTransition(applyMode)

  transition.ready
    .then(() => {
      const expand = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]

      const animation = document.documentElement.animate(
        // 切暗色：圆扩散；切亮色：圆收缩（反向播放同一组关键帧）
        { clipPath: next ? expand : [...expand].reverse() },
        {
          duration: REVEAL_DURATION,
          easing: 'ease-in-out',
          /**
           * 必须显式 forwards：WAAPI 的 fill 默认是 'none'，动画一结束 clip-path 会被还原成
           * 「不裁剪」，于是暗色整屏回闪一帧（实测「暗 → 亮」在 534ms 处闪过一帧暗色）。
           * 保持最后一帧直到 View Transition 自己销毁伪元素，才能做到无闪。
           */
          fill: 'forwards',
          // 切暗色动「新视图」（暗色圆扩散），切亮色动「旧视图」（暗色圆收缩）
          pseudoElement: next ? '::view-transition-new(root)' : '::view-transition-old(root)'
        }
      )

      /**
       * 过渡一结束就把动画取消掉。
       * 带 fill: 'forwards' 的 WAAPI 动画自己不会消失，会一直挂在这个「同名伪元素」上；
       * 下一次（以及之后每次）主题切换时，它作为「已结束的旧动画」一起参与 clip-path 竞争，
       * 表现就是「第一次有动画、后面几次没有动画」。取消后每次过渡里只剩当前这一个动画。
       */
      void transition.finished.then(
        () => animation.cancel(),
        () => animation.cancel()
      )
    })
    .catch(() => {
      // 过渡被跳过（例如连续快速点击），此时主题已经切好了，无需额外处理
    })
}
</script>

<style>
/*
 * View Transitions 的伪元素挂在 <html> 上，scoped 选择器选不中，必须用全局样式。
 * 关掉默认的交叉淡入，只保留下面用 clip-path 驱动的圆形揭示。
 */
::view-transition-old(root),
::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: none;
}

/* 变暗（此时 <html> 已带 .dark）：新视图（暗）盖在旧视图之上，从按钮扩散 */
html.dark::view-transition-new(root) {
  z-index: 2;
}

html.dark::view-transition-old(root) {
  z-index: 1;
}

/* 变亮（此时 <html> 已去掉 .dark）：旧视图（暗）盖在新视图之上，收缩回按钮后露出亮色 */
html:not(.dark)::view-transition-old(root) {
  z-index: 2;
}

html:not(.dark)::view-transition-new(root) {
  z-index: 1;
}
</style>
