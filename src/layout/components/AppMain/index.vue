<template>
  <!-- id 供 TagsViews 右键菜单「全屏内容区域」定位 -->
  <main id="app-main" class="min-h-0 flex-1 overflow-auto bg-(--el-bg-color-page) p-4">
    <RouterView v-slot="{ Component, route }">
      <Transition name="app-main-fade" mode="out-in">
        <!--
          keep-alive 按组件名匹配（include 里是 TagsViews 登记的 meta.cacheName），
          :key 用 route.path 保证「同一组件被多条路由复用」时各缓存一份实例。
        -->
        <KeepAlive :include="tagsViewStore.cachedViews">
          <component :is="Component" :key="route.path" />
        </KeepAlive>
      </Transition>
    </RouterView>
  </main>
</template>

<script setup lang="ts">
import { useTagsViewStore } from '@/stores/modules/tagsView'

defineOptions({ name: 'AppMain' })

const tagsViewStore = useTagsViewStore()
</script>

<style scoped>
/* 过渡必须用具名 CSS 类（<Transition name> 按类名匹配），工具类无法表达 */
.app-main-fade-enter-active,
.app-main-fade-leave-active {
  transition: opacity 0.16s ease;
}

.app-main-fade-enter-from,
.app-main-fade-leave-to {
  opacity: 0;
}
</style>
