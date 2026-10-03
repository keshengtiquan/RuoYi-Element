<template>
  <div v-if="!leaf">
    <ElTooltip
      :disabled="!collapsed && !groupTitleOverflowing"
      :content="item.meta?.title"
      placement="right"
      :offset="10"
      :show-after="120"
    >
      <button
        type="button"
        class="ry-item"
        :class="[itemClass, groupActive ? groupActiveClass : idleClass]"
        :style="indentStyle"
        :aria-expanded="expanded && !collapsed"
        @click="toggleGroup"
      >
        <AppIcon :name="item.meta?.icon" :size="18" />
        <span
          ref="groupTitleRef"
          :class="collapsed ? 'sr-only' : 'min-w-0 flex-1 truncate text-left'"
        >
          {{ item.meta?.title }}
        </span>
        <ChevronDown
          v-show="!collapsed"
          class="size-4 shrink-0 transition-transform duration-200"
          :class="expanded && 'rotate-180'"
        />
      </button>
    </ElTooltip>

    <SidebarCollapse :show="expanded && !collapsed">
      <div class="flex flex-col gap-1 pt-1">
        <SidebarItem
          v-for="(child, index) in menuChildren"
          :key="`${child.path}-${index}`"
          :item="child"
          :base-path="resolveMenuPath(basePath, child.path)"
          :depth="depth + 1"
        />
      </div>
    </SidebarCollapse>
  </div>

  <!-- 叶子菜单项：站内用 RouterLink，外链用 a 标签；折叠态用 tooltip 显示名称 -->
  <ElTooltip
    v-else
    :disabled="!collapsed && !leafTitleOverflowing"
    :content="leaf.title"
    placement="right"
    :offset="10"
    :show-after="120"
  >
    <RouterLink
      v-if="!isExternal"
      :to="leaf.index"
      class="ry-item"
      :class="[itemClass, leafActive ? activeClass : idleClass]"
      :style="indentStyle"
    >
      <AppIcon :name="leaf.icon" :size="18" />
      <span ref="leafTitleRef" :class="collapsed ? 'sr-only' : 'min-w-0 truncate'">
        {{ leaf.title }}
      </span>
    </RouterLink>

    <a
      v-else
      :href="leaf.index"
      target="_blank"
      rel="noopener noreferrer"
      class="ry-item"
      :class="[itemClass, idleClass]"
      :style="indentStyle"
    >
      <AppIcon :name="leaf.icon" :size="18" />
      <span ref="leafTitleRef" :class="collapsed ? 'sr-only' : 'min-w-0 truncate'">
        {{ leaf.title }}
      </span>
    </a>
  </ElTooltip>
</template>

<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import AppIcon from '@/components/AppIcon/index.vue'
import { useAppStore } from '@/stores/modules/app'
import {
  isExternalUrl,
  resolveMenuLeaf,
  resolveMenuPath,
  visibleChildren,
  type MenuNodeLike
} from '@/utils/route'
import SidebarCollapse from './SidebarCollapse.vue'
import { isGroupActive, isPathActive } from './menu'
import { useTextOverflow } from './useTextOverflow'

// 同名自引用实现递归渲染（<SidebarItem> 在模板中指向自身）
defineOptions({ name: 'SidebarItem' })

const props = withDefaults(
  defineProps<{
    /** 菜单节点：RouteRecordRaw 满足该结构，只取渲染菜单需要的字段 */
    item: MenuNodeLike
    /** 该节点的完整路径（父级路径 + 自身 path） */
    basePath: string
    /** 嵌套层级：0 为一级菜单，用于子菜单缩进 */
    depth?: number
  }>(),
  { depth: 0 }
)

const route = useRoute()
const appStore = useAppStore()

const collapsed = computed(() => appStore.sidebarCollapsed)

/**
 * 可降级为单个菜单项时返回叶子信息，否则为 undefined（渲染成可展开分组）。
 * 规则见 resolveMenuLeaf：无可见子菜单→自身，唯一无子菜单的子项→提升该子项。
 */
const leaf = computed(() => resolveMenuLeaf(props.item, props.basePath))

/** 分组模式下要渲染的可见子项 */
const menuChildren = computed(() => visibleChildren(props.item))

/** 叶子是否命中当前路由（含子层级，父级菜单保持高亮） */
const leafActive = computed(() => !!leaf.value && isPathActive(route.path, leaf.value.index))

/** 分组内是否有命中当前路由的菜单项 */
const groupActive = computed(() => isGroupActive(props.item, props.basePath, route.path))

const isExternal = computed(() => isExternalUrl(leaf.value?.index))

/** 分组展开态；进入分组所在路由时自动展开 */
const expanded = ref(groupActive.value)
watch(
  () => route.path,
  () => {
    if (groupActive.value) {
      expanded.value = true
    }
  }
)

/**
 * 分组点击：
 * - 折叠态：先把侧边栏展开，再展开该分组（此时只显示图标，展开子项没有意义）；
 * - 展开态：切换分组的开合（允许多个分组同时展开，与原 el-menu 的 unique-opened=false 一致）。
 */
const toggleGroup = () => {
  if (collapsed.value) {
    appStore.toggleSidebar()
    expanded.value = true
    return
  }
  expanded.value = !expanded.value
}

/**
 * 标题被截断时才弹 tooltip（折叠态本来就没有文字，一律弹）。
 * 分组与叶子各测各的元素，两个分支同时只会渲染一个。
 */
const groupTitleRef = ref<HTMLElement | null>(null)
const leafTitleRef = ref<HTMLElement | null>(null)

const overflowDeps = () => [props.item, props.basePath, collapsed.value, route.path]
const { isOverflowing: groupTitleOverflowing } = useTextOverflow(groupTitleRef, overflowDeps)
const { isOverflowing: leafTitleOverflowing } = useTextOverflow(leafTitleRef, overflowDeps)

/** 子菜单缩进：折叠态只显示图标，不需要缩进 */
const indentStyle = computed(() =>
  props.depth > 0 && !collapsed.value ? { paddingLeft: `${16 + props.depth * 14}px` } : undefined
)

/**
 * 菜单项基础样式（尺寸/圆角取自参考稿：高 40px、间距 4px、左右留白 6px，
 * 圆角复用 Element 的 --el-border-radius-base）。颜色一律走 Element 变量：
 * 主色、暗色面板的自定义变量都在 Sidebar/index.vue 的 .ry-sidebar 作用域内声明。
 */
const itemClass = computed(() => [
  'group flex h-10 w-full cursor-pointer items-center gap-2.5 text-sm  no-underline transition-colors duration-200 select-none',
  'rounded-(--el-border-radius-base)',
  collapsed.value ? 'justify-center px-0' : 'px-4'
])

/** 未选中：次级文字色 + 悬停浅色底 */
const idleClass =
  'text-(--sidebar-text-color) hover:bg-(--sidebar-hover-bg-color) hover:text-(--sidebar-hover-text-color)'

/** 选中：主色底 + 白字，底色与文字色都来自 Element 变量 */
const activeClass = 'bg-(--sidebar-active-bg-color) text-(--sidebar-active-text-color)'

/** 分组含选中项：仅文字与图标染主色，不整块铺底 */
const groupActiveClass =
  'text-(--sidebar-group-active-color) hover:bg-(--sidebar-hover-bg-color) hover:text-(--sidebar-group-active-color)'
</script>

<style scoped></style>
