<template>
  <div class="mobile-layout">
    <main class="layout-content">
      <router-view />
    </main>
    <nav class="bottom-nav" v-if="showBottomNav">
      <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
        <el-icon :size="22"><HomeFilled /></el-icon>
        <span class="nav-label">首页</span>
      </router-link>
      <router-link to="/masterpiece" class="nav-item" :class="{ active: route.path.startsWith('/masterpiece') }">
        <el-icon :size="22"><MagicStick /></el-icon>
        <span class="nav-label">大师</span>
      </router-link>
      <router-link to="/gallery" class="nav-item" v-if="userStore.isLoggedIn" :class="{ active: route.path === '/gallery' }">
        <el-icon :size="22"><Picture /></el-icon>
        <span class="nav-label">图库</span>
      </router-link>
      <router-link to="/profile" class="nav-item" v-if="userStore.isLoggedIn" :class="{ active: route.path === '/profile' }">
        <el-icon :size="22"><User /></el-icon>
        <span class="nav-label">我的</span>
      </router-link>
      <router-link to="/login" class="nav-item" v-if="!userStore.isLoggedIn" :class="{ active: route.path === '/login' }">
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
import { HomeFilled, MagicStick, Picture, User, Key } from '@element-plus/icons-vue'
import LoginTipModal from '@/components/LoginTipModal.vue'

const route = useRoute()
const userStore = useUserStore()

const showBottomNav = computed(() => {
  return !route.path.startsWith('/admin')
})

const showLoginTip = ref(false)
</script>

<style scoped>
.mobile-layout {
  min-height: 100vh;
  background: #fafbfc;
}

.layout-content {
  padding-bottom: 64px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -1px 0 #f0f0f0;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #b3b3b3;
  padding: 8px 16px;
  transition: color 0.2s ease;
  min-width: 56px;
}

.nav-item.active {
  color: #1a1a1a;
}

.nav-item:active {
  opacity: 0.7;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  margin-top: 3px;
  letter-spacing: 0.3px;
}

.nav-item.active .nav-label {
  font-weight: 600;
}
</style>
