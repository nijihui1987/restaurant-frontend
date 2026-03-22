<template>
  <div class="mobile-home">
    <main class="home-content">
      <!-- 功能入口 -->
      <section class="features-section">
        <router-link to="/masterpiece" class="feature-item feature-primary">
          <div class="feature-icon">
            <el-icon :size="24"><MagicStick /></el-icon>
          </div>
          <div class="feature-text">
            <h3>手机随拍成片</h3>
            <p>AI 智能识别，菜品图秒变专业摄影作品</p>
          </div>
          <div class="feature-arrow">
            <el-icon :size="18"><ArrowRight /></el-icon>
          </div>
        </router-link>

        <template v-if="userStore.isLoggedIn">
          <div class="feature-item" @click="goToGallery">
            <div class="feature-icon">
              <el-icon :size="24"><Picture /></el-icon>
            </div>
            <div class="feature-text">
              <h3>我的图库</h3>
              <p>管理您的菜品图片，查看生成历史</p>
            </div>
            <div class="feature-arrow">
              <el-icon :size="18"><ArrowRight /></el-icon>
            </div>
          </div>

          <div class="feature-item" @click="goToProfile">
            <div class="feature-icon">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="feature-text">
              <h3>个人信息</h3>
              <p>修改头像、密码，查看账户信息</p>
            </div>
            <div class="feature-arrow">
              <el-icon :size="18"><ArrowRight /></el-icon>
            </div>
          </div>
        </template>
      </section>

      <!-- 登录提示 -->
      <section class="auth-section" v-if="!userStore.isLoggedIn">
        <p class="auth-hint">登录后可使用完整功能</p>
        <el-button type="primary" size="large" @click="goToLogin" class="auth-btn">
          立即登录
        </el-button>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowRight, Picture, User, MagicStick } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

function goToLogin() {
  router.push('/login')
}

function goToGallery() {
  router.push('/gallery')
}

function goToProfile() {
  router.push('/profile')
}
</script>

<style scoped>
.mobile-home {
  min-height: calc(100vh - var(--space-4xl));
  background: var(--color-bg-page);
}

.home-content {
  padding: 0 var(--space-lg);
  max-width: 480px;
  margin: 0 auto;
}

/* ==================== 功能入口 ==================== */

.features-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.feature-item {
  display: flex;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.feature-item:hover {
  box-shadow: var(--shadow-sm);
}

.feature-item:active {
  transform: scale(0.99);
}

.feature-primary {
  border: 1px solid var(--color-border);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  margin-right: var(--space-md);
  color: var(--color-text-primary);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.feature-primary .feature-icon {
  background: var(--color-primary);
  color: #ffffff;
}

.feature-item:hover .feature-icon {
  transform: scale(1.05);
}

.feature-text {
  flex: 1;
  min-width: 0;
}

.feature-text h3 {
  margin: 0 0 var(--space-xs);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.feature-text p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.feature-arrow {
  color: var(--color-text-placeholder);
  margin-left: var(--space-sm);
  transition: all var(--transition-fast);
}

.feature-item:hover .feature-arrow {
  color: var(--color-text-secondary);
  transform: translateX(4px);
}

/* ==================== 登录提示 ==================== */

.auth-section {
  padding: var(--space-2xl) 0 var(--space-3xl);
  text-align: center;
}

.auth-hint {
  margin: 0 0 var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.auth-btn {
  min-width: 160px;
  height: 48px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  background: var(--color-primary);
  border-color: var(--color-primary);
  transition: all var(--transition-fast);
}

.auth-btn:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.auth-btn:active {
  background: var(--color-primary-active);
  border-color: var(--color-primary-active);
  transform: translateY(0);
}
</style>
