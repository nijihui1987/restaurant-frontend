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
          <div class="card-image" @click.stop>
            <BeforeAfter
              :before-image="feature.beforeImage"
              :after-image="feature.afterImage"
            />
          </div>
          <div class="card-content">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
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
import BeforeAfter from '@/components/BeforeAfter.vue'

const router = useRouter()
const userStore = useUserStore()

const features = [
  {
    path: '/masterpiece',
    title: '手机随拍成片',
    desc: 'AI 智能识别，菜品图秒变专业摄影作品',
    beforeImage: 'https://picsum.photos/seed/dish1before/400/300',
    afterImage: 'https://picsum.photos/seed/dish1after/400/300'
  },
  {
    path: '/batch',
    title: '批量套图成片',
    desc: '一次上传多张，批量处理成专业素材',
    beforeImage: 'https://picsum.photos/seed/batchbefore/400/300',
    afterImage: 'https://picsum.photos/seed/batchafter/400/300'
  },
  {
    path: '/enhance',
    title: '智能高清优化',
    desc: 'AI 提升清晰度，还原图片细节',
    beforeImage: 'https://picsum.photos/seed/enhancebefore/400/300',
    afterImage: 'https://picsum.photos/seed/enhanceafter/400/300'
  },
  {
    path: '/wechat',
    title: '微信营销出图',
    desc: '生成适合微信分享的高质量图片',
    beforeImage: 'https://picsum.photos/seed/wechatbefore/400/300',
    afterImage: 'https://picsum.photos/seed/wechatafter/400/300'
  },
  {
    path: '/dianping',
    title: '大众点评装修',
    desc: '为店铺生成专业的头图和菜单',
    beforeImage: 'https://picsum.photos/seed/dianpingbefore/400/300',
    afterImage: 'https://picsum.photos/seed/dianpingafter/400/300'
  },
  {
    path: '/douyin',
    title: '抖音门店装修',
    desc: '为抖音店铺生成吸睛视觉素材',
    beforeImage: 'https://picsum.photos/seed/douyinbefore/400/300',
    afterImage: 'https://picsum.photos/seed/douyifinal/400/300'
  },
  {
    path: '/menu',
    title: '印刷菜单出图',
    desc: '生成适合印刷的高清菜单图片',
    beforeImage: 'https://picsum.photos/seed/menubefore/400/300',
    afterImage: 'https://picsum.photos/seed/menuafter/400/300'
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
  flex-direction: column;
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
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
  width: 100%;
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
  overflow: hidden;
}

.card-content {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.feature-title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.feature-desc {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
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

/* 移动端 - 单列 */
@media (max-width: 640px) {
  .features-section {
    grid-template-columns: 1fr;
  }
}
</style>
