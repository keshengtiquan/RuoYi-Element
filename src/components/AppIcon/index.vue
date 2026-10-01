<template>
  <ElIcon v-if="icon" class="app-icon" :size="size">
    <component :is="icon" />
  </ElIcon>
</template>

<script setup lang="ts">
import { resolveIcon } from './icons'

defineOptions({ name: 'AppIcon' })

const props = defineProps<{
  /**
   * 图标名，支持四种写法（详见 ./icons.ts）：
   * - RuoYi 老命名：'system' / 'peoples' / 'tree-table'
   * - lucide 名：'circle-check' 或 'CircleCheck'
   * - Iconify 前缀名：'ri:checkbox-circle-line'
   * - 未收录的名字不渲染图标，开发环境给出告警
   */
  name?: string | null
  /** 覆盖图标尺寸（px）。默认继承父级 font-size */
  size?: number | string
}>()

const icon = computed(() => {
  const resolved = resolveIcon(props.name)
  if (!resolved && props.name && import.meta.env.DEV) {
    console.warn(
      `[AppIcon] 未收录的图标名：${props.name}（可在 src/components/AppIcon/icons.ts 登记）`
    )
  }
  return resolved
})
</script>

<style scoped>
.app-icon {
  flex-shrink: 0;
}
</style>
