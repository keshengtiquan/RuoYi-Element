<template>
  <!-- id 供 TagsViews 右键菜单「全屏内容区域」定位 -->
  <main id="app-main" class="min-h-0 flex-1 overflow-auto bg-(--el-bg-color-page) p-4">
    <RouterView v-slot="{ Component, route }">
      <!-- 过渡类名 = animation.scss 里的一组，具体用哪组由设置抽屉「其他配置 → 路由切换动画」决定 -->
      <Transition :name="transitionName" mode="out-in">
        <!--
          keep-alive 按组件名匹配（include 里是 TagsViews 登记的 meta.cacheName），
          :key 用 route.path 保证「同一组件被多条路由复用」时各缓存一份实例；
          v-if 接 tagsViewStore.contentVisible：全局刷新时先销毁再重建（见 store 的 refreshContent）。
          include 接「页面切换缓存」开关：关掉时给空数组 → 不缓存任何组件（已缓存的实例也会被清理）。
        -->
        <KeepAlive :include="keepAliveInclude">
          <component v-if="tagsViewStore.contentVisible" :is="Component" :key="route.path" />
        </KeepAlive>
      </Transition>
    </RouterView>
  </main>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import { useTagsViewStore } from '@/stores/modules/tagsView'
import { resolveRouteTransition } from './transitions'

defineOptions({ name: 'AppMain' })

const appStore = useAppStore()
const tagsViewStore = useTagsViewStore()

/** 路由切换动画（非法值回落到默认动画，避免本地存储被手改后过渡类名对不上） */
const transitionName = computed(() => resolveRouteTransition(appStore.routeTransition))

/** 关掉「页面切换缓存」时不缓存任何页面；打开时按标签登记的 cacheName 缓存 */
const keepAliveInclude = computed(() =>
  appStore.pageCacheEnabled ? tagsViewStore.cachedViews : []
)
</script>

<style scoped></style>
