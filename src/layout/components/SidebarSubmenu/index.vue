<template>
  <aside
    class="flex h-full shrink-0 flex-col overflow-hidden bg-(--sidebar-bg-color) transition-[width] duration-300 ease-in-out"
    :class="hidden ? 'w-0' : 'w-52.5'"
  >
    <!-- 内层固定宽度：收起动画时文字不重排 -->
    <div class="flex h-full w-52.5 flex-col">
      <!-- 头部：系统名称（与 Navbar、图标栏 Logo 同为 56px 高，横向对齐） -->
      <div class="flex h-14 shrink-0 items-center px-4">
        <ElTooltip
          :content="APP_TITLE"
          placement="right"
          :offset="10"
          :show-after="120"
          :disabled="!titleOverflowing"
        >
          <span
            ref="titleRef"
            class="truncate text-[15px] font-semibold text-(--sidebar-text-color)"
          >
            {{ APP_TITLE }}
          </span>
        </ElTooltip>
      </div>

      <ElScrollbar class="min-h-0 flex-1">
        <nav class="flex flex-col gap-1 px-1.5 pb-4" aria-label="二级菜单">
          <SidebarItem
            v-for="entry in entries"
            :key="entry.basePath"
            :item="entry.item"
            :base-path="entry.basePath"
          />
        </nav>
      </ElScrollbar>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { APP_TITLE } from '@/constants/app'
import { useAppStore } from '@/stores/modules/app'
import { resolveMenuLeaf, resolveMenuPath, visibleChildren, type MenuNodeLike } from '@/utils/route'
import SidebarItem from '../Sidebar/SidebarItem.vue'
import { useTextOverflow } from '../Sidebar/useTextOverflow'

defineOptions({ name: 'SidebarSubmenu' })

const props = defineProps<{
  /** 当前选中的一级菜单节点 */
  item?: MenuNodeLike
  /** 该一级菜单的完整路径 */
  basePath: string
}>()

const appStore = useAppStore()

/** 系统名称被截断时才弹 tooltip（名称通常很短，一般不会触发） */
const titleRef = ref<HTMLElement | null>(null)
const { isOverflowing: titleOverflowing } = useTextOverflow(titleRef, () => [APP_TITLE])

/**
 * 当前一级菜单是否「本身就是叶子」（用与经典布局侧边栏同一套降级规则判断）：
 * - 没有可见子菜单（如「若依官网」这类外链菜单）；
 * - 或只有一个没有下级子菜单的子项（如「首页」：/dashboard 下只有 /dashboard/home）。
 *
 * 这种情况在经典布局里也就只显示一个菜单项，所以双栏布局**不再渲染第二栏**，
 * 由图标栏那一个图标直接进页面，避免同一个页面在两级菜单里各出现一次。
 */
const isLeafTop = computed(() => !!props.item && !!resolveMenuLeaf(props.item, props.basePath))

/** 第二栏是否收起：用户手动折叠了侧边栏，或当前一级菜单本身就是叶子 */
const hidden = computed(() => appStore.sidebarCollapsed || isLeafTop.value)

/**
 * 菜单栏里渲染的条目：平铺展示当前一级菜单的可见子菜单
 * （不再套一层可折叠分组，这是双栏布局的常规做法）。
 * 兜底：配了 alwaysShow 却没有子菜单时，展示它自己，避免整栏空白。
 */
const entries = computed<Array<{ item: MenuNodeLike; basePath: string }>>(() => {
  if (!props.item) {
    return []
  }

  const children = visibleChildren(props.item)
  if (children.length) {
    return children.map((child) => ({
      item: child,
      basePath: resolveMenuPath(props.basePath, child.path)
    }))
  }

  return [{ item: props.item, basePath: props.basePath }]
})
</script>

<style scoped></style>
