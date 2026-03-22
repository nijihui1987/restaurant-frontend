<template>
  <div class="mobile-home">
    <main class="home-content">
      <!-- 功能入口 -->
      <section class="features-section">
        <template v-for="feature in featureStore.getVisibleFeatures()" :key="feature.id">
          <div
            v-if="feature.status === 'blocked'"
            class="feature-card"
          >
            <div class="card-image blocked">
              <img :src="feature.image" :alt="feature.title" />
              <div class="blocked-overlay">
                <span class="blocked-text">即将上线</span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-desc">{{ feature.desc }}</p>
            </div>
          </div>
          <router-link
            v-else
            :to="feature.path"
            class="feature-card"
          >
            <div class="card-image">
              <img :src="feature.image" :alt="feature.title" />
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-desc">{{ feature.desc }}</p>
              <div class="card-action">
                <span class="action-text">立即体验</span>
                <el-icon :size="16"><ArrowRight /></el-icon>
              </div>
            </div>
          </router-link>
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFeatureStore } from '@/stores/feature'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const featureStore = useFeatureStore()

onMounted(() => {
  featureStore.loadFeatures()
})

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.mobile-home {
  min-height: calc(100vh - var(--space-4xl));
  background: var(--color-bg-page);
}

.home-content {
  padding: 0 var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
}

/* ==================== 功能卡片 ==================== */

.features-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
  padding-bottom: var(--space-2xl);
}

.feature-card {
  display: flex;
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  min-height: 180px;
}

.feature-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.feature-card:active {
  transform: translateY(-2px);
}

.card-image {
  width: 50%;
  aspect-ratio: 6 / 3;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.feature-card:hover .card-image img {
  transform: scale(1.05);
}

/* blocked 状态 */
.card-image.blocked img {
  filter: grayscale(50%) brightness(0.8);
}

.card-image.blocked {
  cursor: not-allowed;
}

.blocked-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.blocked-text {
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
}

.card-info {
  flex: 1;
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.card-title {
  margin: 0 0 var(--space-xs);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-desc {
  margin: 0 0 var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.card-action {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: gap var(--transition-fast);
}

.feature-card:hover .card-action {
  gap: var(--space-sm);
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

/* ==================== 响应式适配 ==================== */

/* 移动端 */
@media (max-width: 640px) {
  .features-section {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    padding-top: var(--space-lg);
  }

  .feature-card {
    flex-direction: column;
  }

  .card-image {
    width: 100%;
    aspect-ratio: 6 / 3;
  }

  .card-info {
    padding: var(--space-md);
  }

  .card-title {
    font-size: var(--font-size-base);
    margin-bottom: var(--space-xs);
  }

  .card-desc {
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-sm);
  }
}
</style>
