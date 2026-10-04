import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'home',
    component: Layout,
    redirect: '/dashboard/home',
    meta: {
      title: '首页',
      icon: 'layout-dashboard'
    },
    children: [
      {
        path: '/dashboard/home',
        name: 'test',
        component: () => import('@/views/test.vue'),
        meta: {
          title: '首页',
          icon: 'user',
          // 固定标签：TagsViews 里不可关闭，且批量关闭（左侧/右侧/其它/全部）都会保留它
          affix: true,
          // keep-alive 缓存名，需与 views/test.vue 的 defineOptions({ name }) 一致
          cacheName: 'DashboardHome'
        }
      }
    ]
  },
  {
    /*
     * FormItem 全属性示例页。
     * 顶层 meta.hidden 让整棵路由不进侧边栏（useMenuRoutes 只按顶层过滤），
     * 需要看的时候直接访问 #/form-demo/index。
     */
    path: '/form-demo',
    name: 'FormDemoRoot',
    component: Layout,
    redirect: '/form-demo/index',
    meta: {
      title: '表单示例',
      icon: 'file-text',
      hidden: false
    },
    children: [
      {
        path: '/form-demo/index',
        name: 'FormDemo',
        component: () => import('@/views/form-demo/index.vue'),
        meta: {
          title: '表单示例',
          // keep-alive 缓存名，需与 views/form-demo/index.vue 的 defineOptions({ name }) 一致
          cacheName: 'FormDemo'
        }
      }
    ]
  }
]

export default routes
