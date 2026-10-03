<template>
  <ElTooltip
    v-if="isFullscreenSupported"
    :content="isFullscreen ? '退出全屏' : '全屏'"
    placement="bottom"
    :show-after="120"
  >
    <IconButton
      :size="16"
      :aria-label="isFullscreen ? '退出全屏' : '全屏'"
      @click="toggleFullscreen()"
    >
      <Minimize v-if="isFullscreen" />
      <Maximize v-else />
    </IconButton>
  </ElTooltip>

  <ThemeToggle />

  <ElDropdown trigger="click" @command="handleCommand">
    <span
      class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-(--el-text-color-primary) outline-none transition-colors hover:bg-(--el-fill-color-light)"
    >
      <ElAvatar :size="28" :src="userStore.avatar" />
      <span class="whitespace-nowrap">{{ userStore.nickName || userStore.name }}</span>
      <ElIcon><ChevronDown /></ElIcon>
    </span>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem command="logout">
          <div class="flex items-center gap-1">
            <UserRound :size="16" />
            <span>个人信息</span>
          </div>
        </ElDropdownItem>
        <ElDropdownItem command="logout">
          <div class="flex items-center gap-1">
            <LockKeyhole :size="16" />
            <span>修改密码</span>
          </div>
        </ElDropdownItem>
        <ElDropdownItem command="logout">
          <div class="flex items-center gap-1">
            <LogOut :size="16" />
            <span>退出登录</span>
          </div></ElDropdownItem
        >
      </ElDropdownMenu>
    </template>
  </ElDropdown>

  <ElTooltip content="系统设置" placement="bottom" :show-after="120">
    <IconButton :size="16" aria-label="系统设置" @click="settingsVisible = true">
      <SettingsIcon />
    </IconButton>
  </ElTooltip>
  <SettingsPanel v-model:visible="settingsVisible" />
</template>

<script setup lang="ts">
import {
  ChevronDown,
  LockKeyhole,
  LogOut,
  Maximize,
  Minimize,
  Settings as SettingsIcon,
  UserRound
} from '@lucide/vue'
import { ElMessageBox } from 'element-plus'
import IconButton from '@/components/IconButon/index.vue'
import { useUserStore } from '@/stores/modules/user'
import SettingsPanel from '../Settings/index.vue'
import ThemeToggle from '../ThemeToggle/index.vue'

/**
 * 顶栏右侧操作区：全屏、主题、用户菜单、系统设置。
 * 经典布局（Navbar）和顶栏布局（TopNavbar）共用，避免两份维护。
 */
defineOptions({ name: 'NavbarActions' })

const router = useRouter()
const userStore = useUserStore()

/** 系统设置抽屉（标签页样式、布局等全局 UI 配置） */
const settingsVisible = ref(false)

/**
 * 全屏切换（不传 target，默认作用于 document.documentElement）。
 * isSupported 用于在不支持 Fullscreen API 的环境下隐藏按钮；
 * isFullscreen 监听 fullscreenchange，按 ESC 退出（或由其他元素触发全屏）时图标自动同步。
 * 注意：浏览器 F11 属于浏览器级全屏，不经过 Fullscreen API，无法被检测。
 */
const {
  isFullscreen,
  isSupported: isFullscreenSupported,
  toggle: toggleFullscreen
} = useFullscreen()

const handleCommand = async (command: string | number | object) => {
  if (command !== 'logout') {
    return
  }

  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return // 用户取消
  }

  try {
    await userStore.logOut()
  } catch {
    // 退出接口失败也要让用户离开系统
  }
  router.push('/login')
}
</script>

<style scoped></style>
