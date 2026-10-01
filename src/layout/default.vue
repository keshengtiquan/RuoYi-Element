<template>
  <div class="flex h-screen w-full overflow-hidden bg-(--el-bg-color-page)">
    <Sidebar />

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
import Sidebar from './components/Sidebar/index.vue'
import TagsViews from './components/TagsViews/index.vue'

defineOptions({ name: 'DefaultLayout' })
</script>
