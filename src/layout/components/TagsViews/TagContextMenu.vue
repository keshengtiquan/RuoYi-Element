<template>
  <Teleport :to="teleportTarget">
    <Transition name="tag-menu">
      <div
        v-if="visible"
        ref="menuRef"
        data-tag-context-menu
        class="fixed z-3000 min-w-42 rounded-lg border border-(--el-border-color-lighter) bg-(--el-bg-color) p-1 shadow-lg"
        :style="{ left: `${position.left}px`, top: `${position.top}px` }"
        role="menu"
        @mousedown.stop
        @contextmenu.prevent
      >
        <template v-for="item in items" :key="item.key">
          <div v-if="item.divided" class="my-1 h-px bg-(--el-border-color-lighter)" />
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
            :class="
              item.disabled
                ? 'cursor-not-allowed text-(--el-text-color-disabled)'
                : 'cursor-pointer text-(--el-text-color-regular) hover:bg-(--el-fill-color-light) hover:text-(--el-text-color-primary)'
            "
            :disabled="item.disabled"
            @click="emit('select', item.key)"
          >
            <component :is="item.icon" :size="15" class="shrink-0" />
            <span class="whitespace-nowrap">{{ item.label }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { TagContextMenuItem, TagContextMenuKey } from './menu'

defineOptions({ name: 'TagContextMenu' })

const props = defineProps<{
  visible: boolean
  /** 鼠标位置（视口坐标），组件内部会自动收敛到视口内 */
  x: number
  y: number
  items: TagContextMenuItem[]
}>()

const emit = defineEmits<{
  select: [key: TagContextMenuKey]
  close: []
}>()

const menuRef = ref<HTMLElement | null>(null)
const position = ref({ left: 0, top: 0 })

/**
 * 菜单挂载点。
 * 平时挂在 body 上；但「全屏主体区域」后只有全屏元素内部可见，
 * 挂在 body 上的菜单会跟着被隐藏，导致无法用菜单退出全屏，因此全屏时改挂到全屏元素内部。
 */
const teleportTarget = ref<HTMLElement | string>('body')

/** 菜单尺寸未知时先按鼠标位置渲染，渲染完再按视口边界收敛（避免菜单被裁掉） */
watch(
  () => props.visible,
  async (visible) => {
    if (!visible) {
      return
    }

    teleportTarget.value = (document.fullscreenElement as HTMLElement | null) ?? 'body'
    position.value = { left: props.x, top: props.y }
    await nextTick()

    const rect = menuRef.value?.getBoundingClientRect()
    if (!rect) {
      return
    }

    const margin = 8
    position.value = {
      left: Math.max(Math.min(props.x, window.innerWidth - rect.width - margin), margin),
      top: Math.max(Math.min(props.y, window.innerHeight - rect.height - margin), margin)
    }
  }
)

// 点击别处 / 按 ESC / 滚动 / 缩放窗口都关闭菜单（滚动会改变标签位置，菜单留着就会错位）
useEventListener(window, 'mousedown', (event: MouseEvent) => {
  if (props.visible && !menuRef.value?.contains(event.target as Node)) {
    emit('close')
  }
})

useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  if (props.visible && event.key === 'Escape') {
    emit('close')
  }
})

useEventListener(window, 'scroll', () => props.visible && emit('close'), true)
useEventListener(window, 'resize', () => props.visible && emit('close'))
</script>

<style scoped>
.tag-menu-enter-active,
.tag-menu-leave-active {
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
}

.tag-menu-enter-from,
.tag-menu-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
