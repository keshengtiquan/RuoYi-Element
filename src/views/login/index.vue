<template>
  <div class="h-full flex relative overflow-hidden box-border">
    <img :src="loginBg" alt="login illustration" class="" draggable="false" />
    <div class="w-[32%] absolute z-3 right-0 bg-white h-full px-20 flex flex-col justify-center">
      <h2 class="mb-5 text-xl font-bold text-[#1d2129]">用户登录</h2>

      <!-- 密码登录表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable>
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="code">
          <div class="flex w-full items-center gap-3">
            <el-input v-model="form.code" placeholder="请输入验证码" @keyup.enter="handleLogin">
              <template #prefix>
                <el-icon><CircleCheck /></el-icon>
              </template>
            </el-input>
            <div
              class="border border-(--el-border-color) w-30 h-10 rounded-(--el-border-radius-base) box-border text-center select-none cursor-pointer bg-white shrink-0 text-[13px] line-height-[13px] overflow-hidden transition-all duration-200"
            >
              <img
                :src="codeUrl"
                class="object-contain w-full h-full block"
                @click="refreshCaptcha"
                style="
                  filter: brightness(4) hue-rotate(356deg);
                  transform: scaleX(1.4) skewX(-27deg) scale(1.04);
                "
              />
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.rememberMe">记住密码</el-checkbox>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="w-full login-submit"
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { CircleCheck, Lock, User } from '@lucide/vue'
import loginBg from '@/assets/images/login-bg.png'
import { captchaImage } from '@/api/auth'
import { useUserStore } from '@/stores/modules/user'
import { deleteCookie, getCookie, setCookie } from '@/utils/auth'

defineOptions({ name: 'LoginPage' })

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: ''
})
const loading = ref(false)
const codeUrl = ref('')
const captchaEnabled = ref(true)
const redirect = ref<string | undefined>(undefined)

/** 校验规则 */
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const refreshCaptcha = async () => {
  const data = await captchaImage()
  if (data) {
    captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled
    codeUrl.value = 'data:image/gif;base64,' + data.img
    form.uuid = data.uuid
  }
}

/** 登录（模拟） */
async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    refreshCaptcha()
    form.code = ''
    return
  }

  loading.value = true
  try {
    if (form.rememberMe) {
      setCookie('username', form.username, { expires: 30 })
      setCookie('password', form.password, { expires: 30 })
      setCookie('rememberMe', form.rememberMe, { expires: 30 })
    } else {
      // 否则移除
      deleteCookie('username')
      deleteCookie('password')
      deleteCookie('rememberMe')
    }
    userStore.login(form).then(() => {
      const query = route.query
      const otherQueryParams = Object.keys(query).reduce((acc: Record<string, any>, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
      router.push({ path: redirect.value || '/', query: otherQueryParams })
    })
  } finally {
    loading.value = false
  }
}

function getInfoFromCookie(): void {
  const username = getCookie('username')
  const password = getCookie('password')
  const rememberMe = getCookie('rememberMe')

  form.username = username === undefined ? form.username : username
  form.password = password === undefined ? form.password : password
  form.rememberMe = rememberMe === undefined ? false : Boolean(rememberMe)
}

watch(
  route,
  (newRoute: any) => {
    redirect.value = (newRoute.query && newRoute.query.redirect) as string | undefined
  },
  { immediate: true }
)

onMounted(() => {
  refreshCaptcha()
  getInfoFromCookie()
})
</script>

<style scoped></style>
