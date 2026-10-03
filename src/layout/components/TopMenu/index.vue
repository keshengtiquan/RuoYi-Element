<template>
  <ElMenu
    class="top-menu min-w-0 flex-1"
    mode="horizontal"
    :default-active="route.path"
    :ellipsis="true"
    popper-class="top-menu-popup"
    @select="handleSelect"
  >
    <TopMenuItem v-for="item in menuRoutes" :key="item.path" :item="item" :base-path="item.path" />
  </ElMenu>
</template>

<script setup lang="ts">
import { isExternalUrl } from '@/utils/route'
import { useMenuRoutes } from '../Sidebar/useMenuRoutes'
import TopMenuItem from './TopMenuItem.vue'

defineOptions({ name: 'TopMenu' })

const route = useRoute()
const router = useRouter()

/** 与侧边栏 / 双栏布局同一份菜单数据源 */
const menuRoutes = useMenuRoutes()

/**
 * 选中某项：
 * - 外链菜单（叶子 index 是真实网址）→ 新窗口打开，不参与路由；
 * - 站内菜单 → 跳转到该 index（ElMenu 的 index 用的是菜单叶子路径）。
 */
const handleSelect = (index: string): void => {
  if (isExternalUrl(index)) {
    window.open(index, '_blank', 'noopener,noreferrer')
    return
  }
  if (index !== route.path) {
    router.push(index)
  }
}
</script>

<style>
/*
 * 顶栏菜单的样式向「默认布局」的菜单项看齐（对照 Sidebar/SidebarItem.vue）：
 * 40px 高、圆角、悬浮浅底、选中主色块 + 白字。
 *
 * 这里故意不写 scoped：ElMenu 的二级弹层是 teleport 到 body 的，scoped 选择器够不到；
 * 因此统一用 .top-menu（一级菜单条）/ .top-menu-popup（ElMenu 的 popper-class，二级起）
 * 两个类前缀把作用范围限定住。
 */

/* 变量：一级菜单条透明底、与顶栏同高 56px；选中色/悬浮底跟随组件库变量 */
.top-menu {
  --el-menu-bg-color: transparent;
  --el-menu-text-color: var(--el-text-color-regular);
  --el-menu-hover-bg-color: var(--el-fill-color-light);
  --el-menu-active-color: var(--el-color-primary);
  --el-menu-horizontal-height: 3.5rem;
}

.top-menu.el-menu--horizontal {
  align-items: center;
  border-bottom: none;
}

/* 一级项：40px 圆角块（EP 默认是 100% 高 + 底部 2px 下划线，这里全部换掉） */
.top-menu.el-menu--horizontal > .el-menu-item,
.top-menu.el-menu--horizontal > .el-sub-menu > .el-sub-menu__title {
  flex-shrink: 0;
  height: 40px;
  padding: 0 16px;
  margin: 0 2px;
  color: var(--el-text-color-regular);
  border-bottom: none !important;
  border-radius: var(--el-border-radius-base);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* 悬浮：浅底 + 常规文字色（与默认布局的 idleClass 一致） */
.top-menu.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover,
.top-menu.el-menu--horizontal > .el-sub-menu > .el-sub-menu__title:hover {
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-light);
}

/* 选中的一级叶子：主色底 + 白字（与默认布局的 activeClass 一致） */
.top-menu.el-menu--horizontal > .el-menu-item.is-active,
.top-menu.el-menu--horizontal > .el-menu-item.is-active:hover {
  color: var(--el-color-white) !important;
  background-color: var(--el-color-primary);
}

/* 含选中子项的一级目录：只染主色，不铺底（与默认布局的 groupActiveClass 一致） */
.top-menu.el-menu--horizontal > .el-sub-menu.is-active > .el-sub-menu__title,
.top-menu.el-menu--horizontal > .el-sub-menu.is-active > .el-sub-menu__title:hover {
  color: var(--el-color-primary) !important;
  background-color: transparent;
}

/* ---------- 二级 / 三级弹层 ---------- */

/*
 * 尺寸类属性都带 !important：EP 自带的
 * `.el-menu--horizontal .el-menu .el-menu-item`（3 个类）会把行高设成
 * --el-menu-horizontal-sub-item-height（36px），权重比这里的 2 个类高，靠 !important 压回去。
 * （弹层是 teleport 到 body 的，所以整段样式不能写 scoped，用 .top-menu-popup 限定范围。）
 */
.top-menu-popup .el-menu-item,
.top-menu-popup .el-sub-menu__title {
  height: 40px !important;
  padding: 0 12px !important;
  margin: 2px 6px !important;
  line-height: 40px !important;
  color: var(--el-text-color-regular);
  border-radius: var(--el-border-radius-base) !important;
}

/* 目录项右侧要留给展开箭头 */
.top-menu-popup .el-sub-menu__title {
  padding-right: 32px !important;
}

.top-menu-popup .el-menu-item:hover,
.top-menu-popup .el-sub-menu__title:hover {
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-light);
}

.top-menu-popup .el-menu-item.is-active,
.top-menu-popup .el-menu-item.is-active:hover {
  color: var(--el-color-white) !important;
  background-color: var(--el-color-primary) !important;
}

.top-menu-popup .el-sub-menu.is-active > .el-sub-menu__title,
.top-menu-popup .el-sub-menu.is-active > .el-sub-menu__title:hover {
  color: var(--el-color-primary) !important;
  background-color: transparent !important;
}
</style>
