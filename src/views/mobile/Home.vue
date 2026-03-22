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
          <div class="card-left">
            <BeforeAfter
              :before-image="feature.beforeImage"
              :after-image="feature.afterImage"
            />
          </div>
          <div class="card-right">
            <div class="feature-icon">
              <el-icon :size="20"><component :is="feature.icon" /></el-icon>
            </div>
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
import {
  MagicStick,
  Collection,
  Aim,
  ChatDotRound,
  Shop,
  VideoCamera,
  Tickets,
  Picture
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const features = [
  {
    path: '/masterpiece',
    icon: MagicStick,
    title: '手机随拍成片',
    desc: 'AI 智能识别，菜品图秒变专业摄影作品',
    beforeImage: 'https://picsum.photos/seed/dish1before/400/300',
    afterImage: 'https://picsum.photos/seed/dish1after/400/300'
  },
  {
    path: '/batch',
    icon: Collection,
    title: '批量套图成片',
    desc: '一次上传多张，批量处理成专业素材',
    beforeImage: 'https://picsum.photos/seed/batchbefore/400/300',
    afterImage: 'https://picsum.photos/seed/batchafter/400/300'
  },
  {
    path: '/enhance',
    icon: Aim,
    title: '智能高清优化',
    desc: 'AI 提升清晰度，还原图片细节',
    beforeImage: 'https://picsum.photos/seed/enhancebefore/400/300',
    afterImage: 'https://picsum.photos/seed/enhanceafter/400/300'
  },
  {
    path: '/wechat',
    icon: ChatDotRound,
    title: '微信营销出图',
    desc: '生成适合微信分享的高质量图片',
    beforeImage: 'https://picsum.photos/seed/wechatbefore/400/300',
    afterImage: 'https://picsum.photos/seed/wechatafter/400/300'
  },
  {
    path: '/dianping',
    icon: Shop,
    title: '大众点评装修',
    desc: '为店铺生成专业的头图和菜单',
    beforeImage: 'https://picsum.photos/seed/dianpingbefore/400/300',
    afterImage: 'https://picsum.photos/seed/dianpingafter/400/300'
  },
  {
    path: '/douyin',
    icon: VideoCamera,
    title: '抖音门店装修',
    desc: '为抖音店铺生成吸睛视觉素材',
    beforeImage: 'https://picsum.photos/seed/douyinbefore/400/300',
    afterImage: 'https://picsum.photos/seed/douyinafter/400/300'
  },
  {
    path: '/menu',
    icon: Tickets,
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
  max-width: 640px;
  margin: 0 auto;
}

/* ==================== 功能卡片 ==================== */

.features-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding-bottom: var(--space-2xl);
}

.feature-card {
  display: flex;
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-card:active {
  transform: translateY(0);
}

.card-left {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.card-right {
  flex: 1;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.feature-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.feature-title {
  margin: 0 0 var(--space-xs);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.feature-desc {
  margin: 0;
  font-size: var(--font-size-sm);
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
</style>
