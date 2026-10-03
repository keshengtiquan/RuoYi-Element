<template>
  <!-- min-w-0：标题很长时面包屑可以被压缩，否则会把右侧按钮挤出可视区 -->
  <nav class="ml-2.5 min-w-0 max-lg:hidden!" aria-label="面包屑">
    <ul class="flex min-w-0 items-center">
      <!-- 非首页时固定前置首页入口，点击返回首页 -->
      <li v-if="!isHome" class="box-border flex shrink-0 items-center text-sm">
        <button
          type="button"
          class="flex cursor-pointer items-center text-(--el-text-color-secondary) transition-colors hover:text-(--el-text-color-primary)"
          title="首页"
          aria-label="返回首页"
          @click="goHome"
        >
          <AppIcon name="house" :size="14" />
        </button>
        <div
          class="mx-1 shrink-0 text-sm not-italic text-(--el-text-color-secondary)"
          aria-hidden="true"
        >
          /
        </div>
      </li>
      <li
        v-for="(item, index) in breadcrumbItems"
        :key="item.path"
        class="box-border flex items-center text-sm"
        :class="isLast(index) ? 'min-w-0' : 'shrink-0'"
      >
        <!-- 只有最后一级（当前页）允许省略：前面的层级保持完整，符合面包屑的常规读法 -->
        <span
          :class="
            isLast(index)
              ? 'truncate text-(--el-text-color-primary)'
              : 'shrink-0 text-(--el-text-color-secondary)'
          "
          :title="isLast(index) ? item.meta.title : undefined"
        >
          {{ item.meta.title }}
        </span>
        <div
          v-if="!isLast(index)"
          class="mx-1 shrink-0 text-sm not-italic text-(--el-text-color-secondary)"
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
import { HOME_ROUTE_NAME, HOME_ROUTE_PATH } from '@/constants/app'

defineOptions({ name: 'Breadcrumb' })
const route = useRoute()
const router = useRouter()

interface BreadcrumbItem {
  path: string
  meta: RouteMeta
}

/** 首页路由标识（见 router/routes/modules/main.ts：name 为 home，path 为 /dashboard） */

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
