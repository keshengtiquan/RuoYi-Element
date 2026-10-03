<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-(--el-bg-color-page)">
    <!-- 顶栏：Logo + 横向菜单 + 右侧操作 -->
    <header
      class="relative z-30 flex h-14 shrink-0 items-center gap-1 border-b border-(--el-border-color-lighter) bg-(--el-bg-color) px-3"
    >
      <RouterLink to="/" class="flex shrink-0 items-center gap-2.5 pr-1 no-underline">
        <img class="size-6" src="@/assets/vite.svg" alt="logo" />
        <span
          class="truncate text-[15px] font-semibold whitespace-nowrap text-(--el-text-color-primary)"
        >
          {{ APP_TITLE }}
        </span>
      </RouterLink>

      <TopMenu />

      <div class="flex shrink-0 items-center gap-1">
        <NavbarActions />
      </div>
    </header>

    <!-- 主体：标签 + 内容（TagsViews 右键「全屏主体区域」的作用目标） -->
    <div id="app-main-column" class="flex min-h-0 flex-1 flex-col">
      <TagsViews />
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { APP_TITLE } from '@/constants/app'
import AppMain from './components/AppMain/index.vue'
import NavbarActions from './components/NavbarActions/index.vue'
import TagsViews from './components/TagsViews/index.vue'
import TopMenu from './components/TopMenu/index.vue'

defineOptions({ name: 'TopLayout' })
</script>
