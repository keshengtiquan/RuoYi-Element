<template>
  <ElTooltip
    :content="title"
    placement="right"
    :offset="10"
    :show-after="120"
    :disabled="expanded && !isOverflowing"
  >
    <!-- 叶子菜单：直接跳转（外链用 a 标签） -->
    <a
      v-if="isLeaf && external"
      :href="index"
      target="_blank"
      rel="noopener noreferrer"
      :class="itemClass"
      :aria-label="title"
      @click="emit('select', path)"
    >
      <AppIcon :name="icon" :size="18" />
      <span v-if="expanded" ref="labelRef" :class="labelClass">{{ title }}</span>
    </a>
    <RouterLink
      v-else-if="isLeaf"
      :to="index"
      :class="itemClass"
      :aria-label="title"
      @click="emit('select', path)"
    >
      <AppIcon :name="icon" :size="18" />
      <span v-if="expanded" ref="labelRef" :class="labelClass">{{ title }}</span>
    </RouterLink>

    <!-- 目录：只切换右侧菜单栏，不跳转 -->
    <button
      v-else
      type="button"
      :class="itemClass"
      :aria-label="title"
      @click="emit('select', path)"
    >
      <AppIcon :name="icon" :size="18" />
      <span v-if="expanded" ref="labelRef" :class="labelClass">{{ title }}</span>
    </button>
  </ElTooltip>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon/index.vue'
import { useTextOverflow } from '../Sidebar/useTextOverflow'

defineOptions({ name: 'SidebarRailItem' })

const props = defineProps<{
  /** 一级菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 一级菜单路径（用于高亮与点击回传） */
  path: string
  /** 点击跳转目标（叶子是页面路径或外链网址） */
  index: string
  /** 是否叶子（无可见子菜单，或唯一子项被降级） */
  isLeaf: boolean
  /** 是否外链 */
  external: boolean
  /** 是否当前高亮 */
  active: boolean
  /** 一级栏是否展开（展开时图标下方显示文字） */
  expanded: boolean
}>()

const emit = defineEmits<{
  /** 点击：目录只切换右侧菜单栏，叶子由 RouterLink/a 自己跳转 */
  select: [path: string]
}>()

/** 选中：主色底 + 白字（与经典布局的菜单项一致） */
const activeClass = 'bg-(--sidebar-active-bg-color) text-(--sidebar-active-text-color)'

/** 未选中：次级文字色 + 悬停浅色底 */
const idleClass =
  'text-(--sidebar-text-color) hover:bg-(--sidebar-hover-bg-color) hover:text-(--sidebar-hover-text-color)'

/**
 * 收起时 40px 只放图标；展开时 56px，图标在上、文字在下。
 * 必须同时有 justify-center（主轴居中）和 items-center（交叉轴居中）：
 * .el-icon 自身带固定的 1em 宽高，align-items: stretch 对它无效会按 flex-start 贴边，
 * 收起态表现为图标贴顶、展开态表现为图标贴左。
 */
const itemClass = computed(() => [
  'flex w-full cursor-pointer items-center justify-center no-underline transition-colors duration-200 select-none',
  'rounded-(--el-border-radius-base)',
  props.expanded ? 'h-14 flex-col gap-1 px-0.5' : 'h-10',
  props.active ? activeClass : idleClass
])

/** 展开时的文字：居中、单行省略 */
const labelClass = 'w-full truncate text-center text-[11px] leading-none'

/** 收缩态没有文字（tooltip 一律弹）；展开态只在文字被截断时弹 */
const labelRef = ref<HTMLElement | null>(null)
const { isOverflowing } = useTextOverflow(labelRef, () => [props.title, props.expanded])
</script>

<style scoped></style>
