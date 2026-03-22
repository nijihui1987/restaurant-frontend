<template>
  <div class="mobile-home">
    <main class="home-content">
      <!-- 功能入口 -->
      <section class="features-section">
        <router-link
          v-for="feature in features"
          :key="feature.path"
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
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const features = [
  {
    path: '/masterpiece',
    title: '手机随拍成片',
    desc: 'AI 智能识别，菜品图秒变专业摄影作品',
    image: 'https://picsum.photos/seed/masterpiece/600/300'
  },
  {
    path: '/batch',
    title: '批量套图成片',
    desc: '一次上传多张，批量处理成专业素材',
    image: 'https://picsum.photos/seed/batch/600/300'
  },
  {
    path: '/enhance',
    title: '智能高清优化',
    desc: 'AI 提升清晰度，还原图片细节',
    image: 'https://picsum.photos/seed/enhance/600/300'
  },
  {
    path: '/wechat',
    title: '微信营销出图',
    desc: '生成适合微信分享的高质量图片',
    image: 'https://picsum.photos/seed/wechat/600/300'
  },
  {
    path: '/dianping',
    title: '大众点评装修',
    desc: '为店铺生成专业的头图和菜单',
    image: 'https://picsum.photos/seed/dianping/600/300'
  },
  {
    path: '/douyin',
    title: '抖音门店装修',
    desc: '为抖音店铺生成吸睛视觉素材',
    image: 'https://picsum.photos/seed/douyin/600/300'
  },
  {
    path: '/menu',
    title: '印刷菜单出图',
    desc: '生成适合印刷的高清菜单图片',
    image: 'https://picsum.photos/seed/menu/600/300'
  }
]

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

.card-info {
  flex: 1;
  padding: var(--space-lg);
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
  }

  .feature-card {
    flex-direction: row;
  }

  .card-image {
    width: 40%;
    aspect-ratio: 6 / 3;
  }

  .card-info {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
  }

  .card-title {
    font-size: var(--font-size-base);
  }

  .card-desc {
    font-size: var(--font-size-xs);
    margin-bottom: var(--space-xs);
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-action {
    font-size: var(--font-size-xs);
  }
}
</style>
