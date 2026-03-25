import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo, logout as apiLogout, type User, type UserRole } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // Token 从 Cookie 自动获取，不再使用 localStorage
  const token = ref<string>('')
  const userInfo = ref<User | null>(null)
  const isLoading = ref(false)  // 标记是否正在加载用户信息

  // 从 Cookie 读取 access_token
  function getTokenFromCookie(): string {
    const match = document.cookie.match(/access_token=([^;]+)/)
    return match ? match[1] : ''
  }

  const isLoggedIn = computed(() => !!token.value || !!getTokenFromCookie())

  // 角色判断
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const isVip = computed(() => userInfo.value?.role === 'vip')
  const isUser = computed(() => userInfo.value?.role === 'user')
  const isAdminOrVip = computed(() => isAdmin.value || isVip.value)

  // PC 管理后台权限（admin 和 vip 可访问）
  const canAccessAdmin = computed(() => isAdmin.value || isVip.value)

  // 获取角色名称
  const roleName = computed((): string => {
    const names: Record<UserRole, string> = {
      admin: '管理员',
      vip: '专业组',
      user: '用户'
    }
    return userInfo.value ? names[userInfo.value.role] : ''
  })

  async function loginAction(username: string, password: string) {
    const res = await login({ username, password })
    // Token 通过 httpOnly Cookie 自动管理，前端不再存储
    token.value = res.access_token
    await fetchUserInfo()
  }

  async function fetchUserInfo() {
    if (!token.value) return
    isLoading.value = true
    try {
      userInfo.value = await getUserInfo()
    } catch (error) {
      console.error('获取用户信息失败', error)
      logout()
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await apiLogout()
    } catch (error) {
      console.error('登出失败', error)
    }
    token.value = ''
    userInfo.value = null
    // Token 通过 Cookie 清理，后端会在 logout 时清除 Cookie
  }

  // 初始化时尝试获取用户信息
  const initialToken = getTokenFromCookie()
  if (initialToken) {
    token.value = initialToken
    fetchUserInfo()
  }

  return {
    token,
    userInfo,
    isLoading,
    isLoggedIn,
    isAdmin,
    isVip,
    isUser,
    isAdminOrVip,
    canAccessAdmin,
    roleName,
    loginAction,
    logout,
    fetchUserInfo
  }
})