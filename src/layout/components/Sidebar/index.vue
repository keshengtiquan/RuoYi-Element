<template>
  <aside
    class="flex h-full shrink-0 flex-col overflow-hidden bg-(--sidebar-bg-color) transition-[width] duration-300 ease-in-out"
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
        RuoYi Element
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
import type { RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import { usePermissionStore } from '@/stores/modules/permission'
import SidebarItem from './SidebarItem.vue'

defineOptions({ name: 'Sidebar' })

const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const menuRoutes = computed<RouteRecordRaw[]>(() => {
  const staticRoutes = router.options.routes.filter((item) => !item.meta?.hidden)
  const dynamicRoutes = permissionStore.routes.filter((item) => !item.meta?.hidden)
  return [...staticRoutes, ...dynamicRoutes]
})
</script>

<style scoped></style>
