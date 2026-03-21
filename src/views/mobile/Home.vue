<template>
  <div class="mobile-home">
    <header class="home-header">
      <div class="header-content">
        <h1 class="app-name">主厨相机</h1>
        <p class="app-motto">让每一道菜品都成为艺术</p>
      </div>
    </header>

    <main class="home-content">
      <section class="hero-section">
        <div class="hero-visual">
          <div class="hero-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="23" stroke="#1a1a1a" stroke-width="1.5"/>
              <circle cx="24" cy="24" r="8" stroke="#1a1a1a" stroke-width="1.5"/>
              <line x1="24" y1="1" x2="24" y2="11" stroke="#1a1a1a" stroke-width="1.5"/>
              <line x1="24" y1="37" x2="24" y2="47" stroke="#1a1a1a" stroke-width="1.5"/>
              <line x1="1" y1="24" x2="11" y2="24" stroke="#1a1a1a" stroke-width="1.5"/>
              <line x1="37" y1="24" x2="47" y2="24" stroke="#1a1a1a" stroke-width="1.5"/>
            </svg>
          </div>
          <p class="hero-text">专业菜品视觉呈现</p>
        </div>
      </section>

      <section class="features-section">
        <router-link to="/masterpiece" class="feature-item feature-primary">
          <div class="feature-icon">
            <el-icon :size="24"><MagicStick /></el-icon>
          </div>
          <div class="feature-text">
            <h3>大师成相</h3>
            <p>AI 智能识别，菜品图秒变专业摄影作品</p>
          </div>
          <div class="feature-arrow">
            <el-icon :size="20"><ArrowRight /></el-icon>
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
              <el-icon :size="20"><ArrowRight /></el-icon>
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
              <el-icon :size="20"><ArrowRight /></el-icon>
            </div>
          </div>
        </template>
      </section>

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
  min-height: 100vh;
  background: #fafbfc;
}

.home-header {
  background: #ffffff;
  padding: 48px 24px 32px;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  max-width: 400px;
  margin: 0 auto;
}

.app-name {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}

.app-motto {
  font-size: 15px;
  color: #8c8c8c;
  margin: 0;
  letter-spacing: 1px;
}

.home-content {
  padding: 0 16px;
  max-width: 480px;
  margin: 0 auto;
}

.hero-section {
  padding: 40px 0;
}

.hero-visual {
  text-align: center;
}

.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.hero-text {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
  letter-spacing: 1px;
}

.features-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  background: #ffffff;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.feature-item:active {
  transform: scale(0.99);
}

.feature-primary {
  border: 1px solid #e6e6e6;
}

.feature-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  border-radius: 10px;
  margin-right: 16px;
  color: #1a1a1a;
}

.feature-primary .feature-icon {
  background: #1a1a1a;
  color: #ffffff;
}

.feature-text {
  flex: 1;
}

.feature-text h3 {
  margin: 0 0 3px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.feature-text p {
  margin: 0;
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.4;
}

.feature-arrow {
  color: #cccccc;
  margin-left: 12px;
}

.auth-section {
  padding: 32px 0 48px;
  text-align: center;
}

.auth-hint {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 16px;
}

.auth-btn {
  min-width: 160px;
  height: 48px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 24px;
  background: #1a1a1a;
  border-color: #1a1a1a;
  transition: all 0.2s ease;
}

.auth-btn:hover {
  background: #333;
  border-color: #333;
}
</style>
