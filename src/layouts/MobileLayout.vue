<template>
  <div class="mobile-layout">
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
        <span class="brand-tagline">专业菜品视觉呈现</span>
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

    <main class="layout-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <nav class="bottom-nav" v-if="showBottomNav">
      <router-link
        to="/"
        class="nav-item"
        :class="{ active: route.path === '/' }"
      >
        <el-icon :size="22"><Operation /></el-icon>
        <span class="nav-label">功能</span>
      </router-link>
      <router-link
        to="/tutorial"
        class="nav-item"
        :class="{ active: route.path === '/tutorial' }"
      >
        <el-icon :size="22"><Reading /></el-icon>
        <span class="nav-label">教程</span>
      </router-link>
      <router-link
        to="/gallery"
        class="nav-item"
        v-if="userStore.isLoggedIn"
        :class="{ active: route.path === '/gallery' }"
      >
        <el-icon :size="22"><Picture /></el-icon>
        <span class="nav-label">图库</span>
      </router-link>
      <router-link
        to="/profile"
        class="nav-item"
        v-if="userStore.isLoggedIn"
        :class="{ active: route.path === '/profile' }"
      >
        <el-icon :size="22"><User /></el-icon>
        <span class="nav-label">我的</span>
      </router-link>
      <router-link
        to="/login"
        class="nav-item"
        v-if="!userStore.isLoggedIn"
        :class="{ active: route.path === '/login' }"
      >
        <el-icon :size="22"><Key /></el-icon>
        <span class="nav-label">登录</span>
      </router-link>
    </nav>

    <LoginTipModal v-model="showLoginTip" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Operation, Reading, Picture, User, Key } from '@element-plus/icons-vue'
import LoginTipModal from '@/components/LoginTipModal.vue'
import { getAnnouncement, getLogoConfig } from '@/api/config'

const route = useRoute()
const userStore = useUserStore()

const showBottomNav = computed(() => {
  return !route.path.startsWith('/admin')
})

const showLoginTip = ref(false)
const announcement = ref('')
const logoUrl = ref('/images/logo.svg')

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
.mobile-layout {
  min-height: 100vh;
  background: var(--color-bg-page);
}

/* ==================== 顶部通栏 ==================== */

.top-header {
  background: var(--color-bg-surface);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  box-shadow: var(--shadow-sm);
}

.header-brand {
  padding: var(--space-md) var(--space-lg) var(--space-sm);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.brand-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-family: var(--font-family-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
}

.brand-tagline {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wide);
  margin-top: 2px;
}

.header-announcement {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
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
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 主内容区 ==================== */

.layout-content {
  padding-bottom: calc(64px + env(safe-area-inset-bottom));
}

/* ==================== 底部导航 ==================== */

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-bg-surface);
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -1px 0 var(--color-border);
  z-index: var(--z-index-fixed);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--color-text-placeholder);
  padding: var(--space-sm) var(--space-md);
  transition: all var(--transition-fast);
  position: relative;
  min-width: 56px;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 20px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 0 0 1px 1px;
  transition: transform var(--transition-fast) var(--ease-out-quart);
}

.nav-item.active {
  color: var(--color-text-primary);
}

.nav-item.active::before {
  transform: translateX(-50%) scaleX(1);
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  margin-top: 2px;
  letter-spacing: var(--letter-spacing-wide);
  transition: font-weight var(--transition-fast);
}

.nav-item.active .nav-label {
  font-weight: var(--font-weight-semibold);
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
