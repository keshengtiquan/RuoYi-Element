<template>
  <header
    class="flex h-14 shrink-0 items-center gap-1 border-b border-(--el-border-color-lighter) bg-(--el-bg-color) px-2"
  >
    <IconButton :size="16" @click="appStore.toggleSidebar()">
      <PanelLeftClose v-if="!appStore.sidebarCollapsed" />
      <PanelLeftOpen v-else />
    </IconButton>
    <IconButton :size="16">
      <RotateCw />
    </IconButton>
    <Breadcrumb />

    <div class="flex-1" />

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
  </header>
</template>

<script setup lang="ts">
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from '@lucide/vue'
import { ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/modules/app'
import { useUserStore } from '@/stores/modules/user'
import { UserRound, LockKeyhole, LogOut, RotateCw } from '@lucide/vue'
import IconButton from '@/components/IconButon/index.vue'
import Breadcrumb from '../Breadcrumb/index.vue'

defineOptions({ name: 'Navbar' })

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

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
