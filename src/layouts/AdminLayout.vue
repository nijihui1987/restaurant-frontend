<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt="主厨相机"
          class="sidebar-logo"
          @error="handleLogoError"
        />
        <div v-else class="sidebar-brand">
          <span class="brand-name">主厨相机</span>
          <span class="brand-sub">管理后台</span>
        </div>
      </div>

      <nav class="nav-menu">
        <div class="nav-group">
          <router-link to="/admin" class="nav-item" :class="{ active: isActive('/admin') }">
            <el-icon :size="18"><DataLine /></el-icon>
            <span class="nav-label">仪表盘</span>
          </router-link>
          <router-link to="/admin/users" class="nav-item" :class="{ active: isActive('/admin/users') }">
            <el-icon :size="18"><User /></el-icon>
            <span class="nav-label">用户管理</span>
          </router-link>
          <router-link to="/admin/vip" class="nav-item" :class="{ active: isActive('/admin/vip') }">
            <el-icon :size="18"><UserFilled /></el-icon>
            <span class="nav-label">VIP 管理</span>
          </router-link>
          <router-link to="/admin/query" class="nav-item" :class="{ active: isActive('/admin/query') }">
            <el-icon :size="18"><Search /></el-icon>
            <span class="nav-label">数据查询</span>
          </router-link>
          <router-link to="/admin/audit" class="nav-item" :class="{ active: isActive('/admin/audit') }">
            <el-icon :size="18"><CircleCheck /></el-icon>
            <span class="nav-label">任务审核</span>
          </router-link>
        </div>

        <div class="nav-divider" v-if="userStore.isAdmin"></div>

        <div class="nav-group" v-if="userStore.isAdmin">
          <span class="nav-group-title">系统</span>
          <router-link to="/admin/config" class="nav-item" :class="{ active: isActive('/admin/config') }">
            <el-icon :size="18"><Setting /></el-icon>
            <span class="nav-label">系统配置</span>
          </router-link>
          <router-link to="/admin/features" class="nav-item" :class="{ active: isActive('/admin/features') }">
            <el-icon :size="18"><Operation /></el-icon>
            <span class="nav-label">功能配置</span>
          </router-link>
          <router-link to="/admin/maintenance" class="nav-item" :class="{ active: isActive('/admin/maintenance') }">
            <el-icon :size="18"><Tools /></el-icon>
            <span class="nav-label">系统运维</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <router-link to="/" class="header-link">
            <el-icon :size="16"><Monitor /></el-icon>
            <span>移动端</span>
          </router-link>
          <div class="user-badge">
            <span class="role-tag">{{ userStore.roleName }}</span>
            <span class="username">{{ userStore.userInfo?.username }}</span>
          </div>
          <el-button text @click="handleLogout">退出</el-button>
        </div>
      </header>

      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  DataLine,
  User,
  UserFilled,
  Search,
  CircleCheck,
  Setting,
  Operation,
  Tools,
  Monitor
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/admin': '仪表盘',
    '/admin/users': '用户管理',
    '/admin/vip': 'VIP 管理',
    '/admin/query': '数据查询',
    '/admin/audit': '任务审核',
    '/admin/config': '系统配置',
    '/admin/features': '功能配置',
    '/admin/maintenance': '系统运维'
  }
  return map[route.path] || '管理后台'
})

const logoUrl = ref('/images/logo.svg')

function isActive(path: string) {
  return route.path === path
}

function handleLogoError() {
  logoUrl.value = ''
}

async function handleLogout() {
  await ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' })
  await userStore.logout()
  ElMessage.success('已退出')
  router.push('/login')
}

import { ref } from 'vue'
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-page);
}

/* ==================== 侧边栏 ==================== */

.sidebar {
  width: 240px;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  z-index: var(--z-index-sticky);
}

.sidebar-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.sidebar-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.brand-name {
  font-family: var(--font-family-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
}

.brand-sub {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wide);
}

/* ==================== 导航菜单 ==================== */

.nav-menu {
  padding: var(--space-md) 0;
  flex: 1;
}

.nav-group {
  padding: 0 var(--space-sm);
}

.nav-group-title {
  display: block;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-placeholder);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-regular);
  text-decoration: none;
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  margin: 2px var(--space-xs);
  border-radius: var(--radius-md);
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 16px;
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
  transition: transform var(--transition-fast) var(--ease-out-quart);
}

.nav-item:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.nav-item.active::before {
  transform: translateY(-50%) scaleY(1);
}

.nav-item .el-icon {
  margin-right: var(--space-sm);
  flex-shrink: 0;
}

.nav-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-md) var(--space-lg);
}

/* ==================== 主内容区 ==================== */

.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ==================== 头部 ==================== */

.header {
  height: 64px;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xl);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.header-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-regular);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.header-link:hover {
  color: var(--color-text-primary);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.role-tag {
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.username {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* ==================== 内容区 ==================== */

.content {
  flex: 1;
  padding: var(--space-xl);
}

/* ==================== 页面切换动画 ==================== */

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--transition-normal) var(--ease-out-quart);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ==================== Element Plus 覆盖 ==================== */

:deep(.el-button--primary) {
  --el-button-bg-color: var(--color-primary);
  --el-button-border-color: var(--color-primary);
  --el-button-hover-bg-color: var(--color-primary-hover);
  --el-button-hover-border-color: var(--color-primary-hover);
  --el-button-active-bg-color: var(--color-primary-active);
  --el-button-active-border-color: var(--color-primary-active);
}

:deep(.el-button-text) {
  --el-button-text-color: var(--color-text-regular);
  --el-button-hover-text-color: var(--color-text-primary);
}
</style>
