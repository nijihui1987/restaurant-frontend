import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo, logout as apiLogout, type User, type UserRole } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

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
      vip: 'VIP',
      user: '用户'
    }
    return userInfo.value ? names[userInfo.value.role] : ''
  })

  async function loginAction(username: string, password: string) {
    const res = await login({ username, password })
    token.value = res.access_token
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('refresh_token', res.refresh_token)
    await fetchUserInfo()
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      userInfo.value = await getUserInfo()
    } catch (error) {
      console.error('获取用户信息失败', error)
      logout()
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
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
  }

  // 初始化时尝试获取用户信息
  if (token.value) {
    fetchUserInfo()
  }

  return {
    token,
    userInfo,
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