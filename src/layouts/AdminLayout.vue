<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-text">主厨相机</span>
        <span class="logo-tag">管理后台</span>
      </div>
      <nav class="nav-menu">
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
        <div class="nav-divider" v-if="userStore.isAdmin"></div>
        <router-link to="/admin/config" class="nav-item" v-if="userStore.isAdmin" :class="{ active: isActive('/admin/config') }">
          <el-icon :size="18"><Setting /></el-icon>
          <span class="nav-label">系统配置</span>
        </router-link>
        <router-link to="/admin/features" class="nav-item" v-if="userStore.isAdmin" :class="{ active: isActive('/admin/features') }">
          <el-icon :size="18"><Operation /></el-icon>
          <span class="nav-label">功能配置</span>
        </router-link>
        <router-link to="/admin/maintenance" class="nav-item" v-if="userStore.isAdmin" :class="{ active: isActive('/admin/maintenance') }">
          <el-icon :size="18"><Tools /></el-icon>
          <span class="nav-label">系统运维</span>
        </router-link>
      </nav>
    </aside>
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
        <router-view />
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

function isActive(path: string) {
  return route.path === path
}

async function handleLogout() {
  await ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' })
  await userStore.logout()
  ElMessage.success('已退出')
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #f0f0f0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 24px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.logo-text {
  display: block;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.logo-tag {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.nav-menu {
  padding: 12px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #595959;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.15s ease;
  margin: 2px 12px;
  border-radius: 6px;
}

.nav-item:hover {
  background: #fafbfc;
  color: #1a1a1a;
}

.nav-item.active {
  background: #1a1a1a;
  color: #ffffff;
}

.nav-item .el-icon {
  margin-right: 10px;
}

.nav-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 12px 20px;
}

.main-content {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #595959;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s ease;
}

.header-link:hover {
  color: #1a1a1a;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-tag {
  background: #f0f0f0;
  color: #595959;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.username {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 24px 28px;
}
</style>
