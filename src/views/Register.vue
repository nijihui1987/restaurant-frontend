<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Logo 区域 -->
      <div class="register-header">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt="主厨相机"
          class="register-logo"
          @error="handleLogoError"
        />
        <div v-else class="register-brand">
          <span class="brand-name">主厨相机</span>
        </div>
      </div>

      <!-- 注册卡片 -->
      <div class="register-card">
        <div class="card-header">
          <h2 class="card-title">新用户注册</h2>
          <p class="card-hint">创建账号以开始使用</p>
        </div>

        <el-form @submit.prevent="handleRegister" class="register-form">
          <div class="form-item">
            <label class="form-label">用户名</label>
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              class="form-input"
            />
          </div>
          <div class="form-item">
            <label class="form-label">手机号 <span class="optional">(选填)</span></label>
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
              size="large"
              :prefix-icon="Phone"
              class="form-input"
            />
          </div>
          <div class="form-item">
            <label class="form-label">密码</label>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              class="form-input"
            />
          </div>
          <div class="form-item">
            <label class="form-label">确认密码</label>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请确认密码"
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
            注册
          </el-button>
        </el-form>

        <div class="register-footer">
          <span class="footer-text">已有账号？</span>
          <router-link to="/login" class="login-link">立即登录</router-link>
        </div>
      </div>

      <div class="register-legal">
        <p>注册即表示同意<a href="#" class="legal-link">《用户协议》</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone } from '@element-plus/icons-vue'
import { register } from '@/api/auth'
import { getLogoConfig } from '@/api/config'

const router = useRouter()

const form = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)
const logoUrl = ref('/images/logo4.png')

async function fetchLogo() {
  try {
    const config = await getLogoConfig()
    if (config && config.login_logo) {
      logoUrl.value = config.login_logo
    }
  } catch (error) {
    console.error('Failed to fetch logo:', error)
  }
}

function handleLogoError() {
  logoUrl.value = ''
}

async function handleRegister() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  if (form.value.password.length < 6) {
    ElMessage.warning('密码长度不能少于6位')
    return
  }

  loading.value = true
  try {
    await register({
      username: form.value.username,
      password: form.value.password,
      phone: form.value.phone || undefined
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '注册失败')
  } finally {
    loading.value = false
  }
}

fetchLogo()
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: var(--space-xl) var(--space-lg);
}

.register-container {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ==================== Logo 区域 ==================== */

.register-header {
  margin-bottom: var(--space-2xl);
  text-align: center;
}

.register-logo {
  width: 100%;
  height: auto;
  max-height: 80px;
  object-fit: contain;
}

.register-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.brand-name {
  font-family: var(--font-family-display);
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.brand-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
}

/* ==================== 注册卡片 ==================== */

.register-card {
  width: 100%;
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.card-header {
  margin-bottom: var(--space-lg);
}

.card-title {
  margin: 0 0 var(--space-xs);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-hint {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* ==================== 表单 ==================== */

.register-form {
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
  font-weight: 500;
  color: var(--color-text-regular);
}

.optional {
  font-weight: 400;
  color: var(--color-text-placeholder);
}

.form-input {
  --el-input-bg-color: var(--bg-card);
  --el-input-border-color: var(--border-default);
  --el-input-hover-border-color: var(--color-accent);
  --el-input-focus-border-color: var(--color-accent);
}

.form-input :deep(.el-input__wrapper) {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--border-default);
  transition: all var(--transition-fast);
  background: var(--bg-card);
}

.form-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-accent);
}

.form-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-accent);
}

.form-input :deep(.el-input__inner) {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.form-input :deep(.el-input__inner::placeholder) {
  color: var(--color-text-placeholder);
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-md);
  font-weight: 600;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0a0a;
  margin-top: var(--space-sm);
  transition: all var(--transition-fast);
  letter-spacing: 0.02em;
}

.submit-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(196, 149, 106, 0.3);
}

.submit-btn:active {
  background: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
  transform: translateY(0);
}

/* ==================== 页脚 ==================== */

.register-footer {
  margin-top: var(--space-lg);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.login-link {
  color: var(--color-accent);
  font-weight: 500;
  text-decoration: none;
  margin-left: var(--space-xs);
  transition: color var(--transition-fast);
}

.login-link:hover {
  color: var(--color-accent-hover);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.register-legal {
  margin-top: var(--space-xl);
  text-align: center;
}

.register-legal p {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.legal-link {
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color var(--transition-fast);
}

.legal-link:hover {
  color: var(--color-accent);
}
</style>
