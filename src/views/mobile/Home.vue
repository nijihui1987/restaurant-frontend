<template>
  <div class="mobile-home">
    <main class="home-content">
      <!-- 功能入口 -->
      <section class="features-section">
        <template v-for="feature in visibleFeatures" :key="feature.id">
          <router-link
            v-if="feature.path && feature.status !== 'blocked'"
            :to="feature.path"
            class="feature-card"
          >
            <div class="card-image">
              <img :src="feature.image" :alt="feature.title" />
              <div class="title-box">
                <span class="title-text">{{ feature.title }}</span>
              </div>
            </div>
            <div class="card-info">
              <p class="card-desc">{{ feature.desc }}</p>
              <div class="card-action">
                <span class="action-text">{{ feature.actionText || '进入' }}</span>
                <el-icon :size="14"><ArrowRight /></el-icon>
              </div>
            </div>
          </router-link>
          <div
            v-else-if="feature.status === 'blocked'"
            class="feature-card disabled"
          >
            <div class="card-image blocked">
              <img :src="feature.image" :alt="feature.title" />
              <div class="blocked-overlay">
                <span class="blocked-text">{{ feature.blockedText || '即将上线' }}</span>
              </div>
              <div class="title-box">
                <span class="title-text">{{ feature.title }}</span>
              </div>
            </div>
            <div class="card-info">
              <p class="card-desc">{{ feature.desc }}</p>
            </div>
          </div>
          <div
            v-else
            class="feature-card disabled"
          >
            <div class="card-image">
              <img :src="feature.image" :alt="feature.title" />
              <div class="title-box">
                <span class="title-text">{{ feature.title }}</span>
              </div>
            </div>
            <div class="card-info">
              <p class="card-desc">{{ feature.desc }}</p>
              <div class="card-action disabled">
                <span class="action-text">{{ feature.actionText || '进入' }}</span>
                <el-icon :size="14"><ArrowRight /></el-icon>
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
import { ArrowRight } from '@element-plus/icons-vue'

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
  flex-direction: column;
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.feature-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.feature-card:active {
  transform: translateY(-2px);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
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

/* 标题盒子 - 位于图片左上角 */
.title-box {
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
  backdrop-filter: blur(8px);
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.5);
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
}

/* disabled 状态 */
.feature-card.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.feature-card.disabled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
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
  padding: var(--space-md);
  flex: 1;
}

.card-desc {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.card-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-xs);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: gap var(--transition-fast);
}

.feature-card:hover .card-action {
  gap: 4px;
}

.card-action.disabled {
  cursor: not-allowed;
  opacity: 0.5;
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

  .card-image {
    aspect-ratio: 16 / 9;
  }

  .title-box {
    top: 10px;
    left: 10px;
    padding: 5px 10px;
  }

  .title-text {
    font-size: 14px;
  }

  .card-info {
    padding: var(--space-sm) var(--space-md) var(--space-md);
  }

  .card-desc {
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-xs);
  }
}
</style>
