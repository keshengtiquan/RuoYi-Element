<template>
  <component :is="layoutComponent" />
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import { resolveLayout } from './layouts'

// 路由表与 permission store 引用的都是这个组件，name 保持 Layout 不变
defineOptions({ name: 'Layout' })

const appStore = useAppStore()

/** 切换布局只需 appStore.setLayout('xxx')，此处自动响应 */
const layoutComponent = computed(() => resolveLayout(appStore.layout))
</script>
