<template>
  <main class="min-h-0 flex-1 overflow-auto bg-(--el-bg-color-page) p-4">
    <RouterView v-slot="{ Component }">
      <Transition name="app-main-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppMain' })
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
