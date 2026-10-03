<template>
  <!-- 装饰性缩略图：左栏（侧栏）+ 内容区，交互由外层卡片负责 -->
  <div class="sidebar-preview" :class="`sidebar-preview--${style}`" aria-hidden="true">
    <span class="sidebar-preview__bar" />
    <div class="sidebar-preview__content">
      <Check v-if="active" class="sidebar-preview__check" :stroke-width="3" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@lucide/vue'
import type { SidebarStyle } from '@/utils/theme'

defineOptions({ name: 'SidebarPreview' })

defineProps<{
  /** 侧栏风格（未登记的名字按暗色画） */
  style: SidebarStyle
  /** 是否是当前选中的风格：选中时在内容区叠加一个对勾 */
  active?: boolean
}>()
</script>

<style scoped>
/*
 * 三张图同时排在一行，所以不能直接用 --sidebar-bg-color（那是**当前**风格的取值），
 * 三种底色要各写各的 —— 与 styles/tailwind.css 里 html.sidebar-light / sidebar-primary 的取值保持一致。
 */
.sidebar-preview {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--el-fill-color-light);
}

.sidebar-preview__bar {
  flex: none;
  width: 30%;
  height: 100%;
  background-color: #141414; /* 暗色侧栏：与 :root 的 --sidebar-bg-color 同值 */
}

.sidebar-preview--light .sidebar-preview__bar {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
}

.sidebar-preview--primary .sidebar-preview__bar {
  background-color: var(--el-color-primary);
}

/* 内容区：对勾按这个区域居中（不把左栏算进去） */
.sidebar-preview__content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.sidebar-preview__check {
  width: auto;
  height: 48%;
  color: var(--el-color-primary);
}
</style>
