<template>
  <div
    :data-tag-path="tag.path"
    class="relative flex shrink-0 cursor-pointer items-center gap-1.5 text-sm whitespace-nowrap transition-colors select-none"
    :class="[
      styleClass.base,
      active ? styleClass.active : styleClass.idle,
      menuOpen && 'bg-(--el-fill-color-light)'
    ]"
    @click="emit('select', tag)"
    @contextmenu.prevent="emit('contextmenu', tag, $event)"
  >
    <AppIcon v-if="tag.icon" :name="tag.icon" :size="14" />
    <span>{{ tag.title }}</span>

    <!-- 固定标签：不显示关闭按钮，用图钉作为标识 -->
    <Pin v-if="tag.affix" :size="12" class="shrink-0 opacity-60" />
    <button
      v-else
      type="button"
      class="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-(--el-text-color-secondary) transition-colors hover:bg-(--el-fill-color-darker) hover:text-(--el-text-color-primary)"
      :aria-label="`关闭 ${tag.title}`"
      @click.stop="emit('close', tag)"
    >
      <X :size="12" />
    </button>

    <!-- 「指示线」样式：激活态底部的指示条 -->
    <span
      v-if="styleClass.indicator && active"
      class="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-(--el-color-primary)"
    />
  </div>
</template>

<script setup lang="ts">
import { Pin, X } from '@lucide/vue'
import AppIcon from '@/components/AppIcon/index.vue'
import { useAppStore } from '@/stores/modules/app'
import type { TagView } from '@/stores/modules/tagsView'
import { tagStyleClasses } from './styles'

defineOptions({ name: 'TagItem' })

defineProps<{
  /** 标签数据 */
  tag: TagView
  /** 是否为当前激活标签 */
  active: boolean
  /** 右键菜单正对着该标签打开时的高亮 */
  menuOpen?: boolean
}>()

const emit = defineEmits<{
  select: [tag: TagView]
  close: [tag: TagView]
  contextmenu: [tag: TagView, event: MouseEvent]
}>()

const appStore = useAppStore()

/** 当前激活样式对应的 class（三种样式共用同一份结构，只换 class） */
const styleClass = computed(() => tagStyleClasses[appStore.tagStyle])
</script>
