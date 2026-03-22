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
        <span class="brand-tagline">让每一道菜成为艺术</span>
      </div>
      <div class="header-announcement" v-if="announcement">
        <span class="announcement-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="announcement-text">{{ announcement }}</span>
      </div>
    </header>

    <div class="layout-body">
      <!-- 左侧导航 -->
      <aside class="sidebar">
        <nav class="nav-menu">
          <!-- 全部功能（可折叠） -->
          <div class="nav-group">
            <div
              class="nav-parent"
              @click="toggleFeatureMenu"
              :class="{ active: isFeatureMenuActive }"
            >
              <el-icon :size="20"><Operation /></el-icon>
              <span class="nav-label">全部功能</span>
              <el-icon :size="14" class="nav-arrow" :class="{ expanded: featureMenuExpanded }">
                <ArrowRight />
              </el-icon>
            </div>
            <div class="nav-children" v-show="featureMenuExpanded">
              <router-link
                to="/masterpiece"
                class="nav-child"
                :class="{ active: isActive('/masterpiece') }"
              >
                <span class="child-dot"></span>
                <span class="child-label">大师成相</span>
              </router-link>
            </div>
          </div>

          <router-link
            to="/tutorial"
            class="nav-item"
            :class="{ active: isActive('/tutorial') }"
          >
            <el-icon :size="20"><Reading /></el-icon>
            <span class="nav-label">使用教程</span>
          </router-link>

          <router-link
            to="/gallery"
            class="nav-item"
            v-if="userStore.isLoggedIn"
            :class="{ active: isActive('/gallery') }"
          >
            <el-icon :size="20"><Picture /></el-icon>
            <span class="nav-label">我的图库</span>
          </router-link>

          <router-link
            to="/profile"
            class="nav-item"
            v-if="userStore.isLoggedIn"
            :class="{ active: isActive('/profile') }"
          >
            <el-icon :size="20"><User /></el-icon>
            <span class="nav-label">个人设置</span>
          </router-link>

          <router-link
            to="/login"
            class="nav-item"
            v-if="!userStore.isLoggedIn"
            :class="{ active: isActive('/login') }"
          >
            <el-icon :size="20"><Key /></el-icon>
            <span class="nav-label">登录</span>
          </router-link>
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
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Operation, Reading, Picture, User, Key, ArrowRight } from '@element-plus/icons-vue'
import { getAnnouncement, getLogoConfig } from '@/api/config'

const route = useRoute()
const userStore = useUserStore()

const announcement = ref('')
const logoUrl = ref('/images/logo.svg')
const featureMenuExpanded = ref(true) // 默认全部展开

const isFeatureMenuActive = computed(() => {
  return route.path.startsWith('/masterpiece')
})

function toggleFeatureMenu() {
  featureMenuExpanded.value = !featureMenuExpanded.value
}

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
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
    if (config && config.logo_url) {
      logoUrl.value = config.logo_url
    }
  } catch (error) {
    console.error('Failed to fetch logo:', error)
  }
}

function handleLogoError() {
  logoUrl.value = ''
}

fetchAnnouncement()
fetchLogo()
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  background: var(--color-bg-page);
}

/* ==================== 顶部通栏 ==================== */

.top-header {
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
}

.header-brand {
  padding: var(--space-md) var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.brand-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-family: var(--font-family-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
}

.brand-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wide);
}

.header-announcement {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
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

/* ==================== 主体布局 ==================== */

.layout-body {
  display: flex;
  min-height: calc(100vh - 73px);
}

/* ==================== 左侧导航 ==================== */

.sidebar {
  width: 220px;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  position: sticky;
  top: 73px;
  height: calc(100vh - 73px);
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-menu {
  padding: var(--space-md) var(--space-sm);
}

.nav-group {
  margin-bottom: var(--space-xs);
}

.nav-parent {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-regular);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  margin: 2px var(--space-xs);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
}

.nav-parent::before {
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

.nav-parent:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.nav-parent.active {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.nav-parent.active::before {
  transform: translateY(-50%) scaleY(1);
}

.nav-arrow {
  margin-left: auto;
  transition: transform var(--transition-fast);
}

.nav-arrow.expanded {
  transform: rotate(90deg);
}

.nav-children {
  padding-left: var(--space-lg);
}

.nav-child {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  margin: 2px var(--space-xs);
  border-radius: var(--radius-sm);
}

.nav-child:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}

.nav-child.active {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.child-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.nav-child.active .child-dot {
  opacity: 1;
  background: var(--color-primary);
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
