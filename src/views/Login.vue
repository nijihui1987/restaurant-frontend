<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo 区域 -->
      <div class="login-header">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt="主厨相机"
          class="login-logo"
          @error="handleLogoError"
        />
        <div v-else class="login-brand">
          <span class="brand-name">主厨相机</span>
        </div>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <div class="card-header">
          <h2 class="card-title">欢迎回来</h2>
          <p class="card-hint">登录以继续使用</p>
        </div>

        <el-form @submit.prevent="handleLogin" class="login-form">
          <div class="form-item">
            <label class="form-label">用户名</label>
            <el-input
              v-model="username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              class="form-input"
            />
          </div>
          <div class="form-item">
            <label class="form-label">密码</label>
            <el-input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              class="form-input"
            />
          </div>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            size="large"
            class="submit-btn"
          >
            登录
          </el-button>
        </el-form>

        <div class="login-footer">
          <span class="footer-text">新用户？</span>
          <router-link to="/register" class="register-link">立即注册</router-link>
        </div>
      </div>

      <div class="login-legal">
        <p>登录即表示同意<a href="#" class="legal-link">《用户协议》</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getLogoConfig } from '@/api/config'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const logoUrl = ref('/images/logo.png')

async function fetchLogo() {
  try {
    const config = await getLogoConfig()
    if (config && config.logo_url) {
      logoUrl.value = config.logo_url
    }
  } catch (error) {
    console.error('Failed to fetch logo:', error)
  }
}

function handleLogoError() {
  logoUrl.value = ''
}

async function handleLogin() {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    await userStore.loginAction(username.value, password.value)
    ElMessage.success('登录成功')

    if (userStore.canAccessAdmin) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '登录失败')
  } finally {
    loading.value = false
  }
}

fetchLogo()
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-page);
  padding: var(--space-xl) var(--space-lg);
}

.login-container {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ==================== Logo 区域 ==================== */

.login-header {
  margin-bottom: var(--space-2xl);
  text-align: center;
}

.login-logo {
  width: 100%;
  height: auto;
  max-height: 80px;
  object-fit: contain;
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.brand-name {
  font-family: var(--font-family-display);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
}

.brand-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wide);
}

/* ==================== 登录卡片 ==================== */

.login-card {
  width: 100%;
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
}

.card-header {
  margin-bottom: var(--space-lg);
}

.card-title {
  margin: 0 0 var(--space-xs);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-hint {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* ==================== 表单 ==================== */

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-regular);
}

.form-input {
  --el-input-bg-color: var(--color-bg-surface);
  --el-input-border-color: var(--color-border);
  --el-input-hover-border-color: var(--color-border-medium);
  --el-input-focus-border-color: var(--color-primary);
}

.form-input :deep(.el-input__wrapper) {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--color-border);
  transition: all var(--transition-fast);
}

.form-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-border-medium);
}

.form-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-primary);
}

.form-input :deep(.el-input__inner) {
  font-size: var(--font-size-md);
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  border-color: var(--color-primary);
  margin-top: var(--space-sm);
  transition: all var(--transition-fast);
}

.submit-btn:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.submit-btn:active {
  background: var(--color-primary-active);
  border-color: var(--color-primary-active);
  transform: translateY(0);
}

/* ==================== 页脚 ==================== */

.login-footer {
  margin-top: var(--space-lg);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.register-link {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  margin-left: var(--space-xs);
  transition: color var(--transition-fast);
}

.register-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.login-legal {
  margin-top: var(--space-xl);
  text-align: center;
}

.login-legal p {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.legal-link {
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color var(--transition-fast);
}

.legal-link:hover {
  color: var(--color-text-primary);
}
</style>
