<template>
  <aside
    class="flex h-full shrink-0 flex-col overflow-hidden border-r border-(--sidebar-border-color) bg-(--sidebar-bg-color) transition-[width] duration-300 ease-in-out"
    :class="appStore.sidebarCollapsed ? 'w-16' : 'w-52.5'"
  >
    <RouterLink
      to="/"
      class="flex h-14 shrink-0 items-center gap-2.5 overflow-hidden text-(--sidebar-text-color) no-underline"
      :class="appStore.sidebarCollapsed ? 'justify-center px-0' : 'px-4'"
    >
      <img class="size-6 shrink-0" src="@/assets/vite.svg" alt="logo" />
      <span
        v-show="!appStore.sidebarCollapsed"
        class="truncate text-[15px] font-semibold whitespace-nowrap"
      >
        {{ APP_TITLE }}
      </span>
    </RouterLink>

    <ElScrollbar class="min-h-0 flex-1">
      <nav class="flex flex-col gap-1 px-1.5 pb-4" aria-label="侧边栏菜单">
        <SidebarItem
          v-for="(item, index) in menuRoutes"
          :key="`${item.path}-${index}`"
          :item="item"
          :base-path="item.path"
        />
      </nav>
    </ElScrollbar>
  </aside>
</template>

<script setup lang="ts">
import { APP_TITLE } from '@/constants/app'
import { useAppStore } from '@/stores/modules/app'
import SidebarItem from './SidebarItem.vue'
import { useMenuRoutes } from './useMenuRoutes'

defineOptions({ name: 'Sidebar' })

const appStore = useAppStore()

/** 菜单数据源（静态 + 动态路由）统一收口在 useMenuRoutes，双栏布局的图标栏也用它 */
const menuRoutes = useMenuRoutes()
</script>

<style scoped></style>
