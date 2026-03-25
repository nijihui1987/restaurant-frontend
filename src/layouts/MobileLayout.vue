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
        <div class="header-balance" v-if="userStore.isLoggedIn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="balance-star">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span class="balance-num">{{ userBalance.toFixed(0) }}</span>
        </div>
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
        <el-icon :size="22"><Camera /></el-icon>
        <span class="nav-label">开拍</span>
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

    <!-- 移动端浮窗广告 -->
    <div v-if="showFloatingAd" class="floating-ad-overlay" @click="closeFloatingAd">
      <div class="floating-ad-container" @click.stop>
        <img v-if="floatingAdConfig?.image_url" :src="floatingAdConfig.image_url" alt="广告" class="floating-ad-image" @click="handleAdClick" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Camera, Reading, Picture, User, Key } from '@element-plus/icons-vue'
import LoginTipModal from '@/components/LoginTipModal.vue'
import { getAnnouncement, getLogoConfig, getMobileFloatingAd, type FloatingAdConfig } from '@/api/config'
import { getBalance } from '@/api/billing'
import { getRateLimitStatus } from '@/api/masterpiece'

const route = useRoute()
const userStore = useUserStore()

const showBottomNav = computed(() => {
  // 移动端始终显示底部导航（只显示基础功能，不显示管理功能）
  return true
})

const showLoginTip = ref(false)
const announcement = ref('')
const logoUrl = ref('/images/logo.png')
const userBalance = ref(0)

// 速率限制状态
const rateLimitRemaining = ref(0)
let rateLimitTimer: ReturnType<typeof setInterval> | null = null

// 移动端浮窗广告
const floatingAdConfig = ref<FloatingAdConfig | null>(null)
const showFloatingAd = ref(false)

function loadFloatingAd() {
  getMobileFloatingAd().then(config => {
    if (config && config.enabled && config.image_url) {
      floatingAdConfig.value = config
      showFloatingAd.value = true
    }
  })
}

function closeFloatingAd() {
  showFloatingAd.value = false
}

function handleAdClick() {
  closeFloatingAd()
  if (floatingAdConfig.value?.link_url) {
    window.location.href = floatingAdConfig.value.link_url
  }
}

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
      loadRateLimitStatus()
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
    try {
      const data = await getBalance()
      if (data) {
        userBalance.value = data.balance
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }
}

// 页面可见性变化时刷新积分
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    loadUserBalance()
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

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
    if (config && config.mobile_logo) {
      logoUrl.value = config.mobile_logo
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
loadUserBalance()
loadRateLimitStatus()
loadFloatingAd()
</script>

<style scoped>
.mobile-layout {
  min-height: 100vh;
  background: var(--bg-page);
}

/* ==================== 顶部通栏 ==================== */

.top-header {
  background: var(--bg-surface);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border-light);
}

.header-brand {
  padding: var(--space-md) var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
}

.header-balance {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  background: rgba(196, 149, 106, 0.15);
  border: 1px solid rgba(196, 149, 106, 0.3);
  border-radius: var(--radius-full);
}

.balance-star {
  color: var(--color-accent);
}

.balance-num {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-accent);
}

.brand-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.brand-text {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.brand-tagline {
  font-size: 12px;
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wide);
}

.header-announcement {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-xl);
  background: var(--bg-hover);
  border-top: 1px solid var(--border-light);
}

.announcement-icon {
  flex-shrink: 0;
  color: var(--color-accent);
  display: flex;
  align-items: center;
}

.announcement-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.announcement-text.rate-limit-warning {
  color: var(--color-warning);
  font-weight: 500;
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
  background: var(--bg-surface);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--border-light);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--color-text-secondary);
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
  width: 24px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 0 0 2px 2px;
  transition: transform var(--transition-fast) cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item.active {
  color: var(--color-accent);
}

.nav-item.active::before {
  transform: translateX(-50%) scaleX(1);
}

.nav-item:hover {
  color: var(--color-text-primary);
}

.nav-item:active {
  transform: scale(0.92);
}

.nav-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  margin-top: 2px;
  letter-spacing: 0;
  transition: font-weight var(--transition-fast);
}

.nav-item.active .nav-label {
  font-weight: 600;
}

/* ==================== 页面切换动画 ==================== */

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--transition-normal);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ==================== 移动端浮窗广告 ==================== */

.floating-ad-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.floating-ad-container {
  position: relative;
  max-width: 85vw;
  max-height: 70vh;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.floating-ad-image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
