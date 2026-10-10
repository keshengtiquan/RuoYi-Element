<template>
  <!--
    link 类型：用 <a> 模拟链接按钮。
    - 传了 href：真链接，可中键 / 右键新标签打开；
    - 没传 href：拦掉默认跳转，只当"长得像链接的按钮"用（Enter / 空格 也能触发，见 handleLinkKeydown）。
  -->
  <a
    v-if="isLink"
    v-bind="$attrs"
    :class="linkClasses"
    :href="disabled ? undefined : href"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    :role="href ? undefined : 'button'"
    :tabindex="href || disabled ? undefined : 0"
    :aria-disabled="disabled || undefined"
    @click="handleLinkClick"
    @keydown="handleLinkKeydown"
  >
    <AppIcon v-if="resolvedIcon" :name="resolvedIcon" class="mr-1" />
    <span>{{ resolvedLabel }}</span>
  </a>

  <!--
    其余类型：ElButton。
    `$attrs`（class / style / click 等监听）原样透传；ElButton 自己声明了 `emits: ['click']`，
    所以这里不能再手动 emit('click')，否则调用方的 @click 会被触发两次。
  -->
  <ElButton
    v-else
    v-bind="$attrs"
    :type="resolvedColor"
    :plain="resolvedPlain"
    :size="size"
    :disabled="disabled"
    :loading="loading"
  >
    <AppIcon v-if="resolvedIcon" :name="resolvedIcon" class="mr-1" />
    {{ resolvedLabel }}
  </ElButton>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import AppIcon from '@/components/AppIcon/index.vue'
import { ACTION_BUTTON_PRESETS } from './presets'
import type { ActionButtonColor, ActionButtonPreset, ActionButtonProps } from './types'

/**
 * 统一动作按钮：用 `type` 描述"这是什么动作"，文案 / 图标 / 颜色由预设给出。
 *
 * 内置类型（见 ./presets.ts）：`add` 新增、`edit` 编辑、`delete` 删除、`export` 导出、
 * `link` 链接（用 `<a>` 模拟，可传 `href` 真跳转）。本项目的固定启用/禁用、二次确认等业务语义
 * 不在这里，页面自己监听 click 处理。
 *
 * @example
 * <!-- 工具栏：删除选中 + 导出 -->
 * <ActionButton type="delete" :disabled="!selectedIds.length" @click="handleDelete" />
 * <ActionButton type="export" @click="handleExport" />
 * <!-- 行内操作列：编辑 + 外链 -->
 * <ActionButton type="edit" size="small" @click="handleEdit(row)" />
 * <ActionButton type="link" label="官网" href="https://ruoyi.vip" target="_blank" />
 * <!-- 改颜色：红色文字链接（color 对 ElButton / <a> 两种形态都生效） -->
 * <ActionButton type="link" label="删除" color="danger" @click="handleDelete(row)" />
 * <!-- 覆盖预设：把「删除」当朴素的「清空」用 -->
 * <ActionButton type="delete" label="清空" plain @click="handleClean" />
 */
defineOptions({ name: 'ActionButton', inheritAttrs: false })

const props = withDefaults(defineProps<ActionButtonProps>(), {
  size: 'default',
  disabled: false,
  loading: false
})

/** 运行时传了没登记的类型（JS 调用）时的兜底，避免读 undefined.label 崩掉 */
const FALLBACK_PRESET: ActionButtonPreset = { label: '', icon: '' }

/**
 * `<a>` 的文字颜色：语义色 → Tailwind 类。
 *
 * 只能一个一个写全 —— Tailwind 是静态扫描源码里的类名，拼出来的 `text-(--el-color-${x})` 不会被生成。
 * hover 用 EP 的 `-light-3`（5 个语义色都有这套变量）。
 */
const LINK_COLOR_CLASSES: Record<ActionButtonColor, { base: string; hover: string }> = {
  primary: {
    base: 'text-(--el-color-primary)',
    hover: 'hover:text-(--el-color-primary-light-3)'
  },
  success: {
    base: 'text-(--el-color-success)',
    hover: 'hover:text-(--el-color-success-light-3)'
  },
  info: {
    base: 'text-(--el-color-info)',
    hover: 'hover:text-(--el-color-info-light-3)'
  },
  warning: {
    base: 'text-(--el-color-warning)',
    hover: 'hover:text-(--el-color-warning-light-3)'
  },
  danger: {
    base: 'text-(--el-color-danger)',
    hover: 'hover:text-(--el-color-danger-light-3)'
  }
}

/** 当前动作类型的预设：文案 / 图标 / 颜色 */
const preset = computed(() => ACTION_BUTTON_PRESETS[props.type] ?? FALLBACK_PRESET)
const isLink = computed(() => props.type === 'link')
/** 文案：显式传入优先 */
const resolvedLabel = computed(() => props.label ?? preset.value.label)
/** 图标：传 null 表示不要图标，所以只有 undefined 才回落到预设 */
const resolvedIcon = computed(() => (props.icon === undefined ? preset.value.icon : props.icon))
/** 语义色：显式传入优先（ElButton 形态当 type、`<a>` 形态当文字色） */
const resolvedColor = computed<ActionButtonColor>(
  () => props.color ?? preset.value.color ?? 'primary'
)
/** 朴素样式：显式传入优先 */
const resolvedPlain = computed(() => props.plain ?? preset.value.plain ?? false)

/** `<a>` 的样式（两种状态只出现一份颜色类，避免被 Tailwind 的输出顺序决定胜负） */
const linkClasses = computed(() => {
  const base = 'inline-flex items-center no-underline transition-colors'
  if (props.disabled) {
    return [
      base,
      'cursor-not-allowed text-(--el-text-color-disabled) hover:text-(--el-text-color-disabled)'
    ]
  }
  const color = LINK_COLOR_CLASSES[resolvedColor.value]
  return [base, 'cursor-pointer', color.base, color.hover]
})

/** link：禁用或没给 href 时拦掉 `<a>` 的默认跳转（click 仍由 $attrs 上的监听抛出） */
const handleLinkClick = (event: MouseEvent): void => {
  if (props.disabled || !props.href) event.preventDefault()
}

/** 没有 href 时 `<a>` 无法用键盘触发，这里补 Enter / 空格，行为与鼠标点击一致 */
const handleLinkKeydown = (event: KeyboardEvent): void => {
  if (props.disabled || props.href) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  const target = event.currentTarget as HTMLElement | null
  target?.click()
}
</script>
