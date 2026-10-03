<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import { applySidebarStyle, applyThemeColor } from '@/utils/theme'

const appStore = useAppStore()

/**
 * 主题色：把主色及派生色注入 <style>。
 * 放在 App.vue 而不是 main.ts，是为了跟着 store 走 —— 设置抽屉改色、刷新后读持久化值都自动生效；
 * watchEffect 在 setup 阶段先跑一次，所以首屏不会先按默认色画一帧再变色。
 */
watchEffect(() => applyThemeColor(appStore.themeColor))

/** 侧栏风格：在 <html> 上挂 sidebar-light / sidebar-primary 类（配色在 styles/tailwind.css 里） */
watchEffect(() => applySidebarStyle(appStore.sidebarStyle))
</script>

<template>
  <RouterView />
</template>
