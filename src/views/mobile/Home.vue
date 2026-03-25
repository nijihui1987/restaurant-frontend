<template>
  <div class="mobile-home">
    <main class="home-content">
      <!-- 页面标题区 -->
      <section class="hero-section">
        <h1 class="hero-title">
          <span class="hero-line">让每一道菜</span>
          <span class="hero-line accent">都成为作品</span>
        </h1>
        <p class="hero-subtitle">专业菜品视觉呈现，一键生成摄影级素材</p>
      </section>

      <!-- 功能入口 -->
      <section class="features-section">
        <template v-for="(feature, index) in visibleFeatures" :key="feature.id">
          <router-link
            v-if="feature.path && feature.status !== 'blocked'"
            :to="feature.path"
            class="feature-card"
            :style="{ animationDelay: `${index * 80}ms` }"
          >
            <div class="card-image">
              <img :src="feature.image" :alt="feature.title" />
              <div class="card-overlay"></div>
              <div class="title-box">
                <span class="title-text">{{ feature.title }}</span>
              </div>
              <div class="coin-badge" v-if="feature.coinCost">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" class="coin-star">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                <span class="coin-num">{{ feature.coinCost }}</span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-desc">{{ feature.desc }}</p>
              <div class="card-action">
                <span class="action-text">{{ feature.actionText || '进入' }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-arrow">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </router-link>
          <div
            v-else-if="feature.status === 'blocked'"
            class="feature-card disabled"
            :style="{ animationDelay: `${index * 80}ms` }"
          >
            <div class="card-image blocked">
              <img :src="feature.image" :alt="feature.title" />
              <div class="card-overlay dark"></div>
              <div class="blocked-overlay">
                <span class="blocked-text">{{ feature.blockedText || '即将上线' }}</span>
              </div>
              <div class="title-box">
                <span class="title-text">{{ feature.title }}</span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-desc">{{ feature.desc }}</p>
            </div>
          </div>
          <div
            v-else
            class="feature-card"
            :style="{ animationDelay: `${index * 80}ms` }"
          >
            <div class="card-image">
              <img :src="feature.image" :alt="feature.title" />
              <div class="card-overlay"></div>
              <div class="title-box">
                <span class="title-text">{{ feature.title }}</span>
              </div>
              <div class="coin-badge" v-if="feature.coinCost">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" class="coin-star">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                <span class="coin-num">{{ feature.coinCost }}</span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-desc">{{ feature.desc }}</p>
              <div class="card-action disabled">
                <span class="action-text">{{ feature.actionText || '进入' }}</span>
              </div>
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useFeatureStore } from '@/stores/feature'

const router = useRouter()
const userStore = useUserStore()
const featureStore = useFeatureStore()

// 根据用户类型获取功能列表
const visibleFeatures = computed(() => {
  if (userStore.isVip) {
    return featureStore.getVipFeatures()
  }
  return featureStore.getUserFeatures()
})

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
  background: var(--bg-page);
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(139, 90, 43, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(139, 90, 43, 0.02) 0%, transparent 50%);
}

.home-content {
  padding: 0 var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
}

/* ==================== Hero 区域 ==================== */

.hero-section {
  padding: var(--space-3xl) 0 var(--space-2xl);
  text-align: left;
}

.hero-title {
  margin: 0 0 var(--space-md);
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  display: flex;
  flex-direction: column;
}

.hero-line {
  display: block;
  color: var(--color-text-primary);
}

.hero-line.accent {
  color: var(--color-accent);
}

.hero-subtitle {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  letter-spacing: 0.01em;
}

/* ==================== 功能卡片 ==================== */

.features-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
  padding-bottom: var(--space-3xl);
}

.feature-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  opacity: 0;
  transform: translateY(20px);
  animation: cardEnter 0.5s ease forwards;
}

@keyframes cardEnter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--color-accent-light);
}

.feature-card:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.feature-card:hover .card-image img {
  transform: scale(1.08);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.02) 100%
  );
  pointer-events: none;
}

.card-overlay.dark {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
}

/* 标题盒子 */
.title-box {
  position: absolute;
  bottom: var(--space-md);
  left: var(--space-md);
  right: var(--space-md);
}

.title-text {
  display: inline-block;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--bg-surface);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.02em;
}

/* 积分徽章 */
.coin-badge {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(139, 90, 43, 0.9);
  border-radius: var(--radius-full);
  backdrop-filter: blur(8px);
}

.coin-star {
  color: #FFD700;
}

.coin-num {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--bg-surface);
  letter-spacing: 0.02em;
}

/* blocked 状态 */
.card-image.blocked img {
  filter: grayscale(30%) brightness(0.7);
}

.card-image.blocked {
  cursor: not-allowed;
}

.blocked-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blocked-text {
  padding: var(--space-sm) var(--space-lg);
  background: rgba(0, 0, 0, 0.75);
  color: var(--bg-surface);
  font-size: var(--font-size-sm);
  font-weight: 500;
  border-radius: var(--radius-full);
  backdrop-filter: blur(8px);
  letter-spacing: 0.05em;
}

/* 卡片信息区 */
.card-info {
  padding: var(--space-xl);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.card-desc {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  flex: 1;
}

.card-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: gap var(--transition-fast);
}

.feature-card:hover .card-action {
  gap: var(--space-md);
}

.action-arrow {
  transition: transform var(--transition-fast);
}

.feature-card:hover .action-arrow {
  transform: translateX(4px);
}

.card-action.disabled {
  cursor: not-allowed;
  opacity: 0.4;
  color: var(--color-text-placeholder);
}

/* ==================== 登录提示 ==================== */

.auth-section {
  padding: var(--space-3xl) 0 var(--space-4xl);
  text-align: center;
}

.auth-hint {
  margin: 0 0 var(--space-xl);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  letter-spacing: 0.01em;
}

.auth-btn {
  min-width: 180px;
  height: 52px;
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  border-color: var(--color-accent);
  letter-spacing: 0.03em;
  transition: all var(--transition-normal);
}

.auth-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 90, 43, 0.25);
}

.auth-btn:active {
  transform: translateY(0);
}

/* ==================== 响应式适配 ==================== */

@media (max-width: 640px) {
  .hero-section {
    padding: var(--space-2xl) 0 var(--space-xl);
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-base);
  }

  .features-section {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    padding-top: var(--space-md);
  }

  .card-image {
    aspect-ratio: 16 / 10;
  }

  .title-box {
    bottom: var(--space-lg);
    left: var(--space-lg);
    right: var(--space-lg);
  }

  .title-text {
    font-size: var(--font-size-xl);
  }

  .card-info {
    padding: var(--space-lg);
  }

  .card-title {
    font-size: var(--font-size-lg);
  }

  .card-desc {
    font-size: var(--font-size-sm);
  }

  .card-action {
    margin-top: var(--space-md);
  }
}
</style>
