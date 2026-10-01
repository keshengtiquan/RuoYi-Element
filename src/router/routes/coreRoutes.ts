import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

export const coreRoute: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    redirect: '/dashboard',
    meta: { title: '根目录', hidden: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    // 「重新加载」中转路由：TagsViews 跳到 /redirect/<原路径>，
    // 中转页立刻 replace 回原路径，从而让目标页面重新挂载（配合 <KeepAlive> 也拿新实例）。
    // 必须放在最后的 404 兜底路由之前，并且是隐藏路由（不进侧边栏、不进标签页）。
    path: '/redirect',
    name: 'RedirectRoot',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/redirect/index.vue'),
        meta: { title: '重定向', hidden: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  }
]
