<template>
  <div class="mobile-home">
    <main class="home-content">
      <!-- Hero 区域 -->
      <section class="hero-section">
        <div class="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span>专业菜品视觉</span>
        </div>
        <h1 class="hero-title">
          <span class="hero-line">让每一道菜</span>
          <span class="hero-line accent">都成为作品</span>
        </h1>
        <p class="hero-subtitle">一键将随手拍的菜品图<br/>转化为摄影级营销素材</p>

        <!-- CTA 按钮 -->
        <div class="hero-actions" v-if="!userStore.isLoggedIn">
          <el-button type="primary" size="large" @click="goToLogin" class="cta-btn">
            立即开始
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </el-button>
          <p class="hero-hint">登录后可使用完整功能</p>
        </div>
      </section>

      <!-- 功能入口 -->
      <section class="features-section">
        <template v-for="(feature, index) in visibleFeatures" :key="feature.id">
          <router-link
            v-if="feature.path && feature.status !== 'blocked'"
            :to="feature.path"
            class="feature-card"
            :class="{ 'feature-card--large': index === 0 }"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="card-image">
              <img :src="feature.image" :alt="feature.title" />
              <div class="card-gradient"></div>
              <div class="card-number">{{ String(index + 1).padStart(2, '0') }}</div>
              <div class="coin-badge" v-if="feature.coinCost">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" class="coin-star">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                <span class="coin-num">{{ feature.coinCost }}</span>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-desc">{{ feature.desc }}</p>
              <div class="card-footer">
                <span class="card-action">
                  {{ feature.actionText || '进入' }}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </div>
          </router-link>
          <div
            v-else-if="feature.status === 'blocked'"
            class="feature-card disabled"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="card-image blocked">
              <img :src="feature.image" :alt="feature.title" />
              <div class="card-gradient dark"></div>
              <div class="card-number">{{ String(index + 1).padStart(2, '0') }}</div>
              <div class="blocked-overlay">
                <span class="blocked-text">即将上线</span>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ feature.title }}</h3>
              <p class="card-desc">{{ feature.desc }}</p>
            </div>
          </div>
        </template>
      </section>

      <!-- 底部留白 -->
      <div class="bottom-space"></div>
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
  min-height: 100vh;
  background: var(--bg-page);
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰 */
.mobile-home::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(196, 149, 106, 0.08) 0%, transparent 40%),
    radial-gradient(ellipse at 70% 80%, rgba(196, 149, 106, 0.05) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}

.home-content {
  position: relative;
  z-index: 1;
  padding: 0 var(--space-xl);
  max-width: 900px;
  margin: 0 auto;
}

/* ==================== Hero 区域 ==================== */

.hero-section {
  padding: var(--space-5xl) 0 var(--space-4xl);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: rgba(196, 149, 106, 0.1);
  border: 1px solid rgba(196, 149, 106, 0.2);
  border-radius: var(--radius-full);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 500;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-xl);
  animation: fadeInDown 0.6s ease;
}

.hero-badge svg {
  color: var(--color-accent);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  margin: 0 0 var(--space-xl);
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  display: flex;
  flex-direction: column;
  animation: fadeInUp 0.6s ease 0.1s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-line {
  display: block;
  color: var(--color-text-primary);
}

.hero-line.accent {
  color: var(--color-accent);
  position: relative;
}

.hero-line.accent::after {
  content: '';
  position: absolute;
  bottom: 0.1em;
  left: 0;
  width: 100%;
  height: 0.08em;
  background: var(--color-accent);
  opacity: 0.3;
  border-radius: 0.04em;
}

.hero-subtitle {
  margin: 0 0 var(--space-3xl);
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: 1.7;
  letter-spacing: 0.01em;
  animation: fadeInUp 0.6s ease 0.2s both;
}

.hero-actions {
  animation: fadeInUp 0.6s ease 0.3s both;
}

.cta-btn {
  height: 56px;
  padding: 0 var(--space-3xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0a0a;
  letter-spacing: 0.02em;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--space-md);
}

.cta-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(196, 149, 106, 0.3);
}

.cta-btn svg {
  transition: transform var(--transition-fast);
}

.cta-btn:hover svg {
  transform: translateX(4px);
}

.hero-hint {
  margin: var(--space-lg) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* ==================== 功能卡片 ==================== */

.features-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  padding-bottom: var(--space-3xl);
}

/* 第一个卡片更大 */
.feature-card--large {
  grid-column: span 2;
}

.feature-card--large .card-image {
  aspect-ratio: 21 / 9;
}

.feature-card--large .card-title {
  font-size: var(--font-size-2xl);
}

.feature-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
  opacity: 0;
  transform: translateY(30px);
  animation: cardReveal 0.7s ease forwards;
}

@keyframes cardReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(196, 149, 106, 0.1);
  transform: translateY(-6px);
}

.feature-card:active {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.feature-card:hover .card-image img {
  transform: scale(1.1);
}

.card-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}

.card-gradient.dark {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.card-number {
  position: absolute;
  top: var(--space-lg);
  left: var(--space-lg);
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.15);
  letter-spacing: -0.05em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.coin-badge {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-sm) var(--space-md);
  background: rgba(196, 149, 106, 0.9);
  border-radius: var(--radius-full);
  backdrop-filter: blur(8px);
}

.coin-star {
  color: #FFD700;
}

.coin-num {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: 0.02em;
}

/* blocked 状态 */
.card-image.blocked img {
  filter: grayscale(40%) brightness(0.5);
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
  padding: var(--space-sm) var(--space-xl);
  background: rgba(0, 0, 0, 0.8);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  border-radius: var(--radius-full);
  backdrop-filter: blur(8px);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* 卡片内容区 */
.card-content {
  padding: var(--space-xl);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.card-desc {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  flex: 1;
}

.card-footer {
  margin-top: var(--space-lg);
  display: flex;
  justify-content: flex-end;
}

.card-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: gap var(--transition-fast);
}

.feature-card:hover .card-action {
  gap: var(--space-sm);
}

.card-action svg {
  transition: transform var(--transition-fast);
}

.feature-card:hover .card-action svg {
  transform: translateX(3px);
}

/* ==================== 底部留白 ==================== */

.bottom-space {
  height: var(--space-4xl);
}

/* ==================== 响应式适配 ==================== */

@media (max-width: 640px) {
  .hero-section {
    padding: var(--space-4xl) 0 var(--space-3xl);
  }

  .hero-badge {
    margin-bottom: var(--space-lg);
  }

  .hero-title {
    font-size: var(--font-size-4xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-base);
    margin-bottom: var(--space-2xl);
  }

  .cta-btn {
    height: 52px;
    padding: 0 var(--space-2xl);
    font-size: var(--font-size-base);
  }

  .features-section {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .feature-card--large {
    grid-column: span 1;
  }

  .feature-card--large .card-image {
    aspect-ratio: 16 / 10;
  }

  .card-number {
    font-size: var(--font-size-3xl);
    top: var(--space-md);
    left: var(--space-md);
  }

  .card-content {
    padding: var(--space-lg);
  }

  .card-title {
    font-size: var(--font-size-lg);
  }
}
</style>
