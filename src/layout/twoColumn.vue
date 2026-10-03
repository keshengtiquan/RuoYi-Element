<template>
  <div class="flex h-screen w-full overflow-hidden bg-(--el-bg-color-page)">
    <!-- 第一栏：一级菜单图标栏 -->
    <SidebarRail :items="menuRoutes" :active-path="activeTopPath" @select="switchTop" />

    <!-- 第二栏：当前一级菜单下的菜单栏（顶栏左侧的按钮可折叠它） -->
    <SidebarSubmenu :item="activeTopItem" :base-path="activeTopPath" />

    <!-- 右侧主体（顶栏 + 标签 + 内容）：TagsViews 右键「全屏主体区域」的作用目标 -->
    <div id="app-main-column" class="flex min-w-0 flex-1 flex-col">
      <Navbar />
      <TagsViews />
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppMain from './components/AppMain/index.vue'
import Navbar from './components/Navbar/index.vue'
import { useAppStore } from '@/stores/modules/app'
import { resolveMenuLeaf } from '@/utils/route'
import { isGroupActive } from './components/Sidebar/menu'
import { useMenuRoutes } from './components/Sidebar/useMenuRoutes'
import SidebarRail from './components/SidebarRail/index.vue'
import SidebarSubmenu from './components/SidebarSubmenu/index.vue'
import TagsViews from './components/TagsViews/index.vue'

defineOptions({ name: 'TwoColumnLayout' })

const route = useRoute()
const appStore = useAppStore()

const menuRoutes = useMenuRoutes()

/** 点击选中的一级菜单；路由一变就交还给「按路由推导」 */
const overridePath = ref<string | undefined>(undefined)

/**
 * 当前路由落在哪个一级菜单下。
 * 优先用 isGroupActive（目录按其所有后代叶子判断，叶子按自身判断）；
 * 再兜底比较 item.path === 当前路由 path —— 外链菜单的叶子 index 是真实网址（如 https://ruoyi.vip），
 * 而它的路由 path 是 /external/<slug>，只靠 isGroupActive 匹配不上，高亮会跟不过去。
 */
const routeTopPath = computed(
  () =>
    menuRoutes.value.find(
      (item) => isGroupActive(item, item.path, route.path) || item.path === route.path
    )?.path
)

/** 图标栏高亮 + 菜单栏内容都跟它走 */
const activeTopPath = computed(
  () => overridePath.value ?? routeTopPath.value ?? menuRoutes.value[0]?.path ?? ''
)

const activeTopItem = computed(() =>
  menuRoutes.value.find((item) => item.path === activeTopPath.value)
)

watch(
  () => route.path,
  () => {
    overridePath.value = undefined
  }
)

/**
 * 点击一级菜单：切换菜单栏内容，跳转交给叶子项自己。
 *
 * 菜单栏被折叠（顶栏左侧按钮收起、宽度为 0）时，点一级菜单要顺带把菜单栏展开回来，
 * 否则点了「没反应」；叶子一级菜单没有子菜单可看，就不用动折叠状态。
 */
const switchTop = (path: string): void => {
  overridePath.value = path

  const entry = menuRoutes.value.find((item) => item.path === path)
  const isLeafTop = !!entry && !!resolveMenuLeaf(entry, path)

  if (!isLeafTop && appStore.sidebarCollapsed) {
    appStore.toggleSidebar()
  }
}
</script>
