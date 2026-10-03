<template>
  <aside
    class="flex h-full shrink-0 flex-col overflow-hidden border-r border-(--sidebar-border-color) bg-(--sidebar-bg-color) transition-[width] duration-300 ease-in-out"
    :class="appStore.railExpanded ? 'w-22' : 'w-16'"
  >
    <!-- 内层固定宽度：展开/收起动画时文字不重排 -->
    <div class="flex h-full flex-col" :class="appStore.railExpanded ? 'w-22' : 'w-16'">
      <!-- Logo -->
      <RouterLink to="/" class="flex h-14 shrink-0 items-center justify-center no-underline">
        <img class="size-6" src="@/assets/vite.svg" alt="logo" />
      </RouterLink>

      <!-- 一级菜单：只放图标；展开时图标下方带文字（长标题单行省略 + tooltip） -->
      <ElScrollbar class="min-h-0 flex-1">
        <nav class="flex flex-col gap-1 px-1.5 pb-2" aria-label="一级菜单">
          <SidebarRailItem
            v-for="entry in entries"
            :key="entry.path"
            :title="entry.title"
            :icon="entry.icon"
            :path="entry.path"
            :index="entry.index"
            :is-leaf="entry.isLeaf"
            :external="entry.external"
            :active="entry.path === activePath"
            :expanded="appStore.railExpanded"
            @select="emit('select', $event)"
          />
        </nav>
      </ElScrollbar>

      <!-- 底部切换按钮：展开/收起「一级图标下的文字」及其栏宽 -->
      <ElTooltip
        :content="appStore.railExpanded ? '收起一级菜单' : '展开一级菜单'"
        placement="right"
        :offset="10"
        :show-after="120"
      >
        <button
          type="button"
          class="flex h-12 w-full shrink-0 cursor-pointer items-center justify-center border-t border-(--sidebar-border-color) text-(--sidebar-text-color) transition-colors hover:bg-(--sidebar-hover-bg-color) hover:text-(--sidebar-hover-text-color)"
          :aria-label="appStore.railExpanded ? '收起一级菜单' : '展开一级菜单'"
          @click="appStore.toggleRail()"
        >
          <!--
            展开状态用 aria-label 表达（展开一级菜单 / 收起一级菜单）。
            不用 aria-expanded：ElTooltip 的 popper trigger 会用自己的 aria-expanded 覆盖并移除
            写在触发器上的同名属性（见 element-plus/es/components/popper/src/trigger*）。
          -->
          <ChevronsLeft v-if="appStore.railExpanded" :size="18" />
          <ChevronsRight v-else :size="18" />
        </button>
      </ElTooltip>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ChevronsLeft, ChevronsRight } from '@lucide/vue'
import { useAppStore } from '@/stores/modules/app'
import { isExternalUrl, resolveMenuLeaf, type MenuNodeLike } from '@/utils/route'
import SidebarRailItem from '../SidebarRailItem/index.vue'

defineOptions({ name: 'SidebarRail' })

const props = defineProps<{
  /** 一级菜单列表（通常来自 useMenuRoutes） */
  items: MenuNodeLike[]
  /** 当前高亮的一级菜单路径 */
  activePath: string
}>()

const emit = defineEmits<{
  /** 点击一级菜单：目录只切换右侧菜单栏，叶子由 RouterLink/a 自己跳转 */
  select: [path: string]
}>()

const appStore = useAppStore()

const entries = computed(() =>
  props.items
    .map((item) => {
      const basePath = item.path
      // 无可见子菜单、或只有一个子菜单被降级时，这个一级项本身就是「叶子」
      const leaf = resolveMenuLeaf(item, basePath)
      const index = leaf?.index ?? basePath
      return {
        path: basePath,
        title: item.meta?.title ?? '',
        icon: item.meta?.icon,
        isLeaf: !!leaf,
        external: isExternalUrl(index),
        index
      }
    })
    .filter((entry) => entry.title)
)
</script>

<style scoped></style>
