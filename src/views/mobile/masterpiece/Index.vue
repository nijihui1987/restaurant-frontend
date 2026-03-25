<template>
  <div class="masterpiece-intro">
    <main class="intro-content">
      <h1 class="page-title">{{ pageTitle }}</h1>

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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFeatureStore } from '@/stores/feature'

const router = useRouter()
const userStore = useUserStore()
const featureStore = useFeatureStore()

const pageTitle = computed(() => {
  const feature = featureStore.features.find(f => f.path === '/masterpiece')
  return feature?.title || '大师成相'
})

onMounted(() => {
  featureStore.loadFeatures()
})

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
  background: var(--bg-page);
}

.intro-content {
  padding: 24px 20px;
  max-width: 480px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 20px;
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
}

.compare-section {
  background: var(--bg-surface);
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
  background: var(--bg-hover);
  color: var(--color-text-secondary);
}

.compare-visual.after {
  background: var(--color-text-primary);
  color: var(--bg-surface);
}

.compare-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.compare-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}

.compare-arrow {
  color: var(--border-default);
  padding: 0 12px;
}

.steps-section {
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 20px;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
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
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  width: 28px;
}

.step-text {
  font-size: 15px;
  color: var(--color-text-regular);
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
  background: var(--color-text-primary);
  border-color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.start-btn:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.action-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 12px;
}
</style>
