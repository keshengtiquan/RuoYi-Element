<template>
  <div
    :class="hidden ? 'pointer-events-none invisible absolute top-0 left-0' : 'relative shrink-0'"
    @mouseenter="emit('open')"
    @mouseleave="emit('close')"
  >
    <button
      type="button"
      class="relative flex h-14 cursor-pointer items-center gap-1.5 px-3 text-sm transition-colors"
      :class="
        active
          ? 'text-(--el-color-primary)'
          : 'text-(--el-text-color-regular) hover:bg-(--el-fill-color-light) hover:text-(--el-text-color-primary)'
      "
      :aria-haspopup="isLeaf ? undefined : 'menu'"
      :aria-expanded="isLeaf ? undefined : open"
      @click="isLeaf ? emit('navigate', index) : emit('activate')"
    >
      <AppIcon v-if="icon" :name="icon" :size="16" />
      <span class="whitespace-nowrap">{{ title }}</span>
      <ChevronDown
        v-if="!isLeaf"
        class="size-3.5 shrink-0 transition-transform duration-200"
        :class="open && 'rotate-180'"
      />
      <!-- 激活指示线：贴在顶栏底部 -->
      <span
        v-if="active"
        class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-(--el-color-primary)"
      />
    </button>

    <!-- 二级弹层：悬停或点击展开；面板是触发器的子元素，鼠标移进面板不会误关 -->
    <div v-show="open && !hidden" class="absolute top-full left-0 z-50 pt-1">
      <ul
        class="min-w-44 rounded-lg border border-(--el-border-color-lighter) bg-(--el-bg-color) p-1 shadow-lg"
        role="menu"
      >
        <slot name="panel" />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import AppIcon from '@/components/AppIcon/index.vue'

defineOptions({ name: 'TopMenuBarItem' })

defineProps<{
  /** 菜单名 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 是否当前路由所在的一级菜单 */
  active: boolean
  /** 弹层是否展开 */
  open: boolean
  /** 是否叶子（叶子点击直接跳转，没有弹层） */
  isLeaf: boolean
  /** 叶子跳转目标（站内路径或外链网址） */
  index: string
  /**
   * 是否被折叠（放不下、收进「更多」）。
   * 折叠项脱离文档流并隐藏，但仍在 DOM 里 —— 这样宽度依然可测，容器变宽时能自动放回来。
   */
  hidden?: boolean
}>()

const emit = defineEmits<{
  /** 鼠标进入 / 键盘聚焦：展开弹层 */
  open: []
  /** 鼠标离开：收起弹层 */
  close: []
  /** 点击目录项：展开弹层（不 toggle：悬停已经展开了，再点一下关掉会很别扭） */
  activate: []
  /** 点击叶子项：跳转 */
  navigate: [index: string]
}>()
</script>

<style scoped></style>
