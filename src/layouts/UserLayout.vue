<template>
  <div class="user-layout">
    <!-- 顶部通栏 -->
    <header class="top-header">
      <div class="header-brand">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt="主厨相机"
          class="brand-logo"
          @error="handleLogoError"
        />
        <span v-else class="brand-text">主厨相机</span>
      </div>
      <div class="header-announcement" v-if="rateLimitRemaining > 0">
        <span class="announcement-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="announcement-text rate-limit-warning">
          您的操作过于频繁，请 {{ rateLimitRemaining }} 秒后重试
        </span>
      </div>
      <div class="header-announcement" v-else-if="announcement">
        <span class="announcement-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="announcement-text">{{ announcement }}</span>
      </div>
      <div class="header-user" v-if="userStore.isLoggedIn">
        <div class="user-balance">
          <span class="balance-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </span>
          <span class="balance-amount">{{ userBalance.toFixed(0) }}</span>
        </div>
        <div class="user-info">
          <span class="username">{{ userStore.userInfo?.username }}</span>
        </div>
      </div>
    </header>

    <div class="layout-body">
      <!-- 左侧导航 -->
      <aside class="sidebar">
        <nav class="nav-menu">
          <!-- ========== 公开区域（无需登录可见）========== -->
          <div class="nav-section">
            <span class="nav-section-title">导航</span>
            <router-link to="/" class="nav-item" :class="{ active: isActive('/') }">
              <el-icon :size="18"><HomeFilled /></el-icon>
              <span class="nav-label">首页</span>
            </router-link>
            <router-link to="/tutorial" class="nav-item" :class="{ active: isActive('/tutorial') }">
              <el-icon :size="18"><Reading /></el-icon>
              <span class="nav-label">使用教程</span>
            </router-link>
          </div>

          <!-- ========== 用户功能（登录后可见，与导航同级）========== -->
          <div class="nav-section" v-if="userStore.isLoggedIn">
            <span class="nav-section-title">用户功能</span>
            <router-link
              v-for="feature in sidebarFeatures"
              :key="feature.id"
              :to="feature.path"
              class="nav-item"
              :class="{ active: isActive(feature.path) }"
            >
              <el-icon :size="18"><component :is="getFeatureIcon(feature.path)" /></el-icon>
              <span class="nav-label">{{ feature.title }}</span>
            </router-link>
            <router-link to="/gallery" class="nav-item" :class="{ active: isActive('/gallery') }">
              <el-icon :size="18"><Picture /></el-icon>
              <span class="nav-label">我的图库</span>
            </router-link>
            <router-link to="/billing" class="nav-item" :class="{ active: isActive('/billing') }">
              <el-icon :size="18"><Document /></el-icon>
              <span class="nav-label">账单查询</span>
            </router-link>
          </div>

          <!-- ========== 专业组功能（VIP 可见）========== -->
          <div class="nav-section" v-if="userStore.isVip">
            <span class="nav-section-title">专业组功能</span>
            <router-link to="/customers" class="nav-item" :class="{ active: isActive('/customers') }">
              <el-icon :size="18"><OfficeBuilding /></el-icon>
              <span class="nav-label">客户管理</span>
            </router-link>
            <router-link to="/query" class="nav-item" :class="{ active: isActive('/query') }">
              <el-icon :size="18"><Search /></el-icon>
              <span class="nav-label">数据查询</span>
            </router-link>
            <router-link to="/audit" class="nav-item" :class="{ active: isActive('/audit') }">
              <el-icon :size="18"><CircleCheck /></el-icon>
              <span class="nav-label">任务审核</span>
            </router-link>
          </div>

          <!-- ========== 系统管理（仅 Admin 可见）========== -->
          <div class="nav-section" v-if="userStore.isAdmin">
            <span class="nav-section-title">系统管理</span>
            <router-link to="/dashboard" class="nav-item" :class="{ active: isActive('/dashboard') }">
              <el-icon :size="18"><DataLine /></el-icon>
              <span class="nav-label">仪表盘</span>
            </router-link>
            <router-link to="/users" class="nav-item" :class="{ active: isActive('/users') }">
              <el-icon :size="18"><User /></el-icon>
              <span class="nav-label">用户管理</span>
            </router-link>
            <router-link to="/vip" class="nav-item" :class="{ active: isActive('/vip') }">
              <el-icon :size="18"><UserFilled /></el-icon>
              <span class="nav-label">专业组管理</span>
            </router-link>
            <router-link to="/config" class="nav-item" :class="{ active: isActive('/config') }">
              <el-icon :size="18"><Setting /></el-icon>
              <span class="nav-label">系统配置</span>
            </router-link>
            <router-link to="/features" class="nav-item" :class="{ active: isActive('/features') }">
              <el-icon :size="18"><Operation /></el-icon>
              <span class="nav-label">功能配置</span>
            </router-link>
            <router-link to="/maintenance" class="nav-item" :class="{ active: isActive('/maintenance') }">
              <el-icon :size="18"><Tools /></el-icon>
              <span class="nav-label">系统运维</span>
            </router-link>
          </div>

          <!-- ========== 个人设置（登录后显示在最下面）========== -->
          <div class="nav-section nav-section-bottom" v-if="userStore.isLoggedIn">
            <div class="nav-item-group">
              <router-link to="/profile" class="nav-item" :class="{ active: isActive('/profile') }">
                <el-icon :size="18"><User /></el-icon>
                <span class="nav-label">个人设置</span>
              </router-link>
              <div class="nav-item logout-icon" @click="handleLogout" title="退出登录">
                <el-icon :size="18"><SwitchButton /></el-icon>
              </div>
            </div>
          </div>

          <!-- ========== 登录入口（未登录显示）========== -->
          <div class="nav-section" v-if="!userStore.isLoggedIn">
            <router-link to="/login" class="nav-item" :class="{ active: isActive('/login') }">
              <el-icon :size="18"><Key /></el-icon>
              <span class="nav-label">登录</span>
            </router-link>
          </div>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useFeatureStore } from '@/stores/feature'
import {
  HomeFilled,
  Reading,
  Picture,
  User,
  UserFilled,
  Key,
  MagicStick,
  Search,
  CircleCheck,
  DataLine,
  Setting,
  Operation,
  Tools,
  Document,
  OfficeBuilding,
  SwitchButton,
  Collection,
  Aim,
  ChatDotRound,
  Shop,
  VideoCamera,
  Tickets
} from '@element-plus/icons-vue'
import { getAnnouncement, getLogoConfig } from '@/api/config'
import { getBalance } from '@/api/billing'
import { getRateLimitStatus } from '@/api/masterpiece'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const featureStore = useFeatureStore()

const userBalance = ref(0)

// 速率限制状态
const rateLimitRemaining = ref(0)
let rateLimitTimer: ReturnType<typeof setInterval> | null = null

async function loadRateLimitStatus() {
  if (!userStore.isLoggedIn) {
    rateLimitRemaining.value = 0
    stopRateLimitTimer()
    return
  }

  try {
    const data = await getRateLimitStatus()
    if (data && data.is_blocked) {
      rateLimitRemaining.value = data.remaining_seconds
      startRateLimitTimer()
    } else {
      rateLimitRemaining.value = 0
      stopRateLimitTimer()
    }
  } catch (error) {
    console.error('Failed to fetch rate limit status:', error)
  }
}

function startRateLimitTimer() {
  stopRateLimitTimer()
  rateLimitTimer = setInterval(() => {
    if (rateLimitRemaining.value > 0) {
      rateLimitRemaining.value--
    } else {
      stopRateLimitTimer()
      loadRateLimitStatus() // 重新检查状态
    }
  }, 1000)
}

function stopRateLimitTimer() {
  if (rateLimitTimer) {
    clearInterval(rateLimitTimer)
    rateLimitTimer = null
  }
}

async function loadUserBalance() {
  if (userStore.isLoggedIn) {
    const data = await getBalance()
    if (data) {
      userBalance.value = data.balance
    }
  }
}

const announcement = ref('')
const logoUrl = ref('/images/logo.png')

// 功能图标映射
const featureIcons: Record<string, any> = {
  '/masterpiece': MagicStick,
  '/batch': Collection,
  '/enhance': Aim,
  '/wechat': ChatDotRound,
  '/dianping': Shop,
  '/douyin': VideoCamera,
  '/menu': Tickets
}

function isActive(path: string) {
  if (!path) return false
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// 根据用户类型获取功能列表
const visibleFeatures = computed(() => {
  if (userStore.isVip) {
    return featureStore.getVipFeatures()
  }
  return featureStore.getUserFeatures()
})

// 侧边栏功能导航：过滤掉空路径的功能
const sidebarFeatures = computed(() => {
  return visibleFeatures.value.filter(f => f.path && f.path.trim() !== '')
})

function getFeatureIcon(path: string) {
  return featureIcons[path] || Picture
}

async function fetchAnnouncement() {
  try {
    const config = await getAnnouncement()
    if (config && config.enabled && config.content) {
      announcement.value = config.content
    }
  } catch (error) {
    console.error('Failed to fetch announcement:', error)
  }
}

async function fetchLogo() {
  try {
    const config = await getLogoConfig()
    if (config && config.pc_logo) {
      logoUrl.value = config.pc_logo
    }
  } catch (error) {
    console.error('Failed to fetch logo:', error)
  }
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

fetchAnnouncement()
fetchLogo()
loadUserBalance()
featureStore.loadFeatures()
loadRateLimitStatus()
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  background: var(--color-bg-page);
}

/* ==================== 顶部通栏 ==================== */

.top-header {
  background: var(--color-bg-surface);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  display: flex;
  align-items: stretch;
  height: 64px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: 0 var(--space-2xl);
  width: 240px;
  flex-shrink: 0;
}

.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-family: var(--font-family-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
}

.brand-tagline {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wide);
}

.header-announcement {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-2xl);
  flex: 1;
}

.announcement-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.announcement-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.announcement-text.rate-limit-warning {
  color: #e6a23c;
  font-weight: 500;
}

.header-user {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: 0 var(--space-2xl);
  margin-left: auto;
  flex-shrink: 0;
}

.user-balance {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 6px 12px;
  border-radius: var(--radius-md);
}

.balance-icon {
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.balance-amount {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-family: 'SF Mono', Monaco, monospace;
}

.balance-unit {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.user-info {
  display: flex;
  align-items: center;
}

.username {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* ==================== 主体布局 ==================== */

.layout-body {
  display: flex;
  height: calc(100vh - 64px);
}

/* ==================== 左侧导航 ==================== */

.sidebar {
  width: 240px;
  background: var(--color-bg-surface);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.nav-menu {
  padding: var(--space-md) var(--space-sm);
  flex: 1;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: var(--space-lg);
}

.nav-section-bottom {
  padding: var(--space-md) var(--space-sm);
  background: var(--color-bg-surface);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.nav-section-title {
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
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-regular);
  text-decoration: none;
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  margin: 2px var(--space-xs);
  border-radius: var(--radius-md);
  position: relative;
  cursor: pointer;
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
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
}

.logout-item {
  color: var(--color-text-secondary);
}

.logout-item:hover {
  color: var(--color-error);
  background: var(--color-bg-hover);
}

.nav-item-group {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.nav-item-group .nav-item {
  flex: 1;
}

.logout-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logout-icon:hover {
  color: var(--color-error);
  background: var(--color-bg-hover);
}

/* ==================== 主内容区 ==================== */

.main-content {
  flex: 1;
  min-width: 0;
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
</style>
