import { getInfoApi, loginApi, logoutApi, type UserInfoResult } from '@/api/auth'
import { getToken, removeToken, setToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'
import { isEmpty, isHttp } from '@/utils/validate'
import { ElMessageBox } from 'element-plus'
import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tagsView'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string | undefined>(getToken())
    const id = ref<string | undefined>('')
    const name = ref<string | undefined>('')
    const nickName = ref<string | undefined>('')
    const avatar = ref<string | undefined>('')
    const roles = ref<string[]>([])
    const permissions = ref<string[]>([])

    const login = (userInfo: {
      username: string
      password: string
      code: string
      uuid: string
    }) => {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise<void>((resolve, reject) => {
        loginApi(username, password, code, uuid)
          .then((res) => {
            setToken(res.token)
            token.value = res.token
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    }

    const getInfo = () => {
      return new Promise<UserInfoResult>((resolve, reject) => {
        getInfoApi()
          .then((res) => {
            const user = res.user
            // 注意：局部变量不要命名为 avatar，否则会遮蔽 store 的 avatar ref
            let userAvatar = user.avatar || ''
            if (!isHttp(userAvatar)) {
              userAvatar = isEmpty(userAvatar) ? defAva : import.meta.env.VITE_API_URL + userAvatar
            }
            id.value = String(user.userId)
            name.value = user.userName
            nickName.value = user.nickName
            avatar.value = userAvatar
            if (res.roles && res.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              roles.value = res.roles
              permissions.value = res.permissions
            } else {
              roles.value = ['ROLE_DEFAULT']
            }
            /* 初始密码提示 */
            if (res.isDefaultModifyPwd) {
              ElMessageBox.confirm('您的密码还是初始密码，请修改密码！', '安全提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  // TODO 跳转到修改密码页面
                  //   router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
                })
                .catch(() => {})
            }
            /* 过期密码提示 */
            if (!res.isDefaultModifyPwd && res.isPasswordExpired) {
              ElMessageBox.confirm('您的密码已过期，请尽快修改密码！', '安全提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  // TODO 跳转到修改密码页面
                  //   router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } })
                })
                .catch(() => {})
            }
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    }

    const logOut = () => {
      return new Promise<void>((resolve, reject) => {
        logoutApi()
          .then(() => {
            token.value = ''
            roles.value = []
            permissions.value = []
            removeToken()
            // 清除动态路由状态，使下次登录重新拉取；
            // 已注册到 router 的路由会在下次 generateRoutes 时被移除。
            usePermissionStore().resetRoutes()
            // 同时清空标签页与 keep-alive 缓存，避免下一个账号看到上一个账号的标签
            useTagsViewStore().reset()
            resolve()
          })
          .catch((error: any) => {
            reject(error)
          })
      })
    }

    return {
      token,
      id,
      name,
      nickName,
      avatar,
      roles,
      permissions,
      login,
      getInfo,
      logOut
    }
  },
  {
    persist: {
      key: 'user',
      storage: localStorage
    }
  }
)
