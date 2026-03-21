<template>
  <div class="masterpiece-intro">
    <header class="intro-header">
      <button class="back-btn" @click="goBack">
        <el-icon :size="24"><ArrowLeft /></el-icon>
      </button>
      <h1>大师成相</h1>
    </header>

    <main class="intro-content">
      <section class="compare-section">
        <div class="compare-grid">
          <div class="compare-item">
            <div class="compare-visual before">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="14" cy="16" r="3" stroke="currentColor" stroke-width="1.5"/>
                <path d="M4 28L12 20L18 26L26 18L36 28" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <span class="compare-label">随手拍</span>
            <p class="compare-desc">普通手机拍摄</p>
          </div>

          <div class="compare-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="compare-item">
            <div class="compare-visual after">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="14" cy="16" r="3" stroke="currentColor" stroke-width="1.5"/>
                <path d="M4 28L12 20L18 26L26 18L36 28" stroke="currentColor" stroke-width="1.5"/>
                <path d="M28 4L36 12" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <span class="compare-label">大师作品</span>
            <p class="compare-desc">AI 专业效果</p>
          </div>
        </div>
      </section>

      <section class="steps-section">
        <h2 class="section-title">操作流程</h2>
        <div class="step-list">
          <div class="step-item">
            <span class="step-num">01</span>
            <span class="step-text">上传菜品照片</span>
          </div>
          <div class="step-item">
            <span class="step-num">02</span>
            <span class="step-text">AI 智能识别内容</span>
          </div>
          <div class="step-item">
            <span class="step-num">03</span>
            <span class="step-text">匹配专业背景模板</span>
          </div>
          <div class="step-item">
            <span class="step-num">04</span>
            <span class="step-text">生成多张效果图</span>
          </div>
          <div class="step-item">
            <span class="step-num">05</span>
            <span class="step-text">高清化输出</span>
          </div>
        </div>
      </section>

      <section class="action-section">
        <el-button type="primary" size="large" @click="startProcess" class="start-btn">
          开始制作
        </el-button>
        <p class="action-hint" v-if="!userStore.isLoggedIn">登录后可开始使用</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

function goBack() {
  router.back()
}

function startProcess() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  router.push('/masterpiece/upload')
}
</script>

<style scoped>
.masterpiece-intro {
  min-height: 100vh;
  background: #fafbfc;
}

.intro-header {
  background: #ffffff;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 #f0f0f0;
}

.back-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.intro-content {
  padding: 24px 20px;
  max-width: 480px;
  margin: 0 auto;
}

.compare-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.compare-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.compare-item {
  text-align: center;
  flex: 1;
}

.compare-visual {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.compare-visual.before {
  background: #f5f5f5;
  color: #8c8c8c;
}

.compare-visual.after {
  background: #1a1a1a;
  color: #ffffff;
}

.compare-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.compare-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin: 0;
}

.compare-arrow {
  color: #d9d9d9;
  padding: 0 12px;
}

.steps-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 20px;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.step-num {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  font-variant-numeric: tabular-nums;
  width: 28px;
}

.step-text {
  font-size: 15px;
  color: #595959;
}

.action-section {
  text-align: center;
  padding: 8px 0 24px;
}

.start-btn {
  width: 100%;
  max-width: 280px;
  height: 52px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 26px;
  background: #1a1a1a;
  border-color: #1a1a1a;
  transition: all 0.2s ease;
}

.start-btn:hover {
  background: #333;
  border-color: #333;
}

.action-hint {
  font-size: 13px;
  color: #8c8c8c;
  margin-top: 12px;
}
</style>
