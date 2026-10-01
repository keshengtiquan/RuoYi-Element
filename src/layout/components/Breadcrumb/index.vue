<template>
  <nav class="ml-2.5 max-lg:hidden!">
    <ul class="flex items-center">
      <!-- 非首页时固定前置首页入口，点击返回首页 -->
      <li v-if="!isHome" class="box-border flex justify-center items-center text-sm">
        <button
          type="button"
          class="flex cursor-pointer items-center text-(--el-text-color-secondary) transition-colors hover:text-(--el-text-color-primary)"
          title="首页"
          aria-label="返回首页"
          @click="goHome"
        >
          <AppIcon name="house" :size="14" />
        </button>
        <div class="mx-1 text-sm not-italic text-(--el-text-color-secondary)" aria-hidden="true">
          /
        </div>
      </li>
      <li
        class="box-border flex justify-center items-center text-sm"
        v-for="(item, index) in breadcrumbItems"
        :key="item.path"
      >
        <span
          :class="
            isLast(index) ? 'text-(--el-text-color-primary)' : 'text-(--el-text-color-secondary)'
          "
        >
          {{ item.meta.title }}
        </span>
        <div
          v-if="!isLast(index)"
          class="mx-1 text-sm not-italic text-(--el-text-color-secondary)"
          aria-hidden="true"
        >
          /
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { RouteLocationMatched, RouteMeta } from 'vue-router'
import AppIcon from '@/components/AppIcon/index.vue'

defineOptions({ name: 'Breadcrumb' })
const route = useRoute()
const router = useRouter()

interface BreadcrumbItem {
  path: string
  meta: RouteMeta
}

/** 首页路由标识（见 router/routes/modules/main.ts：name 为 home，path 为 /dashboard） */
const HOME_ROUTE_NAME = 'home'
const HOME_ROUTE_PATH = '/dashboard'

// 辅助函数：判断是否为首页
const isHomeRoute = (record?: RouteLocationMatched): boolean => {
  if (!record) {
    return false
  }
  return record.name === HOME_ROUTE_NAME || record.path === HOME_ROUTE_PATH
}

/** 当前是否处于首页 */
const isHome = computed(() => isHomeRoute(route.matched[0]))

/** 点击首页图标回到首页 */
const goHome = (): void => {
  router.push(HOME_ROUTE_PATH)
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const { matched } = route
  if (!matched.length) {
    return []
  }

  // 首页只显示「首页」一项
  if (isHome.value) {
    return [{ path: matched[0].path, meta: matched[0].meta }]
  }

  // 非首页展示完整面包屑
  return matched.map((item) => {
    return {
      path: item.path,
      meta: item.meta
    }
  })
})

// 最后一项不拼接 /，并高亮为主题主色
const isLast = (index: number): boolean => index === breadcrumbItems.value.length - 1
</script>

<style scoped></style>
