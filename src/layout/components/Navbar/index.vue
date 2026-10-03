<template>
  <header
    class="flex h-14 shrink-0 items-center gap-1 border-b border-(--el-border-color-lighter) bg-(--el-bg-color) px-2"
  >
    <IconButton :size="16" aria-label="切换侧边栏" @click="appStore.toggleSidebar()">
      <PanelLeftClose v-if="!appStore.sidebarCollapsed" />
      <PanelLeftOpen v-else />
    </IconButton>
    <ElTooltip content="刷新页面" placement="bottom" :show-after="120">
      <IconButton :size="16" aria-label="刷新页面" @click="tagsViewStore.refreshContent()">
        <RotateCw />
      </IconButton>
    </ElTooltip>
    <Breadcrumb />

    <div class="flex-1" />
    <NavbarActions />
  </header>
</template>

<script setup lang="ts">
import { PanelLeftClose, PanelLeftOpen, RotateCw } from '@lucide/vue'
import IconButton from '@/components/IconButon/index.vue'
import { useAppStore } from '@/stores/modules/app'
import { useTagsViewStore } from '@/stores/modules/tagsView'
import Breadcrumb from '../Breadcrumb/index.vue'
import NavbarActions from '../NavbarActions/index.vue'

defineOptions({ name: 'Navbar' })

const appStore = useAppStore()
const tagsViewStore = useTagsViewStore()
</script>

<style scoped></style>
