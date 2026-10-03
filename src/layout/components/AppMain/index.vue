<template>
  <!-- id 供 TagsViews 右键菜单「全屏内容区域」定位 -->
  <main id="app-main" class="min-h-0 flex-1 overflow-auto bg-(--el-bg-color-page) p-4">
    <RouterView v-slot="{ Component, route }">
      <Transition name="slide-right" mode="out-in">
        <!--
          keep-alive 按组件名匹配（include 里是 TagsViews 登记的 meta.cacheName），
          :key 用 route.path 保证「同一组件被多条路由复用」时各缓存一份实例；
          v-if 接 tagsViewStore.contentVisible：全局刷新时先销毁再重建（见 store 的 refreshContent）。
        -->
        <KeepAlive :include="tagsViewStore.cachedViews">
          <component v-if="tagsViewStore.contentVisible" :is="Component" :key="route.path" />
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

<style scoped></style>
