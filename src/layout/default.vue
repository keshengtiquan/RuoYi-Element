<template>
  <div class="flex h-screen w-full overflow-hidden bg-(--el-bg-color-page)">
    <Sidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <Navbar />
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppMain from './components/AppMain/index.vue'
import Navbar from './components/Navbar/index.vue'
import Sidebar from './components/Sidebar/index.vue'

defineOptions({ name: 'DefaultLayout' })
</script>
