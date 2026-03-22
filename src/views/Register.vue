<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="logo">主厨相机</h1>
      <p class="tagline">专业菜品视觉呈现</p>
    </div>

    <div class="login-card">
      <h2 class="login-title">新用户注册</h2>
      <p class="login-hint">创建账号以开始使用</p>

      <el-form @submit.prevent="handleRegister" class="login-form">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号（选填）"
            size="large"
            :prefix-icon="Phone"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            size="large"
            class="login-btn"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-hint-text">
        <span>已有账号？</span>
        <router-link to="/login" class="register-link">立即登录</router-link>
      </div>
    </div>

    <div class="login-footer">
      <p>注册即表示同意<a href="#" class="link">《用户协议》</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone } from '@element-plus/icons-vue'
import { register } from '@/api/auth'

const router = useRouter()

const form = ref({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)

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
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  padding: 40px 24px;
}

.login-header {
  text-align: center;
  margin-bottom: 48px;
}

.logo {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 15px;
  color: #8c8c8c;
  margin: 0;
  letter-spacing: 2px;
}

.login-card {
  width: 100%;
  max-width: 340px;
  background: #ffffff;
  border-radius: 12px;
  padding: 32px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
}

.login-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.login-hint {
  margin: 0 0 28px;
  font-size: 14px;
  color: #8c8c8c;
}

.login-form {
  margin-top: 0;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 4px 16px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e6e6e6;
  transition: box-shadow 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover),
.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #1a1a1a;
}

.login-form :deep(.el-input__inner) {
  font-size: 15px;
  height: 40px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: #1a1a1a;
  border-color: #1a1a1a;
  margin-top: 8px;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: #333;
  border-color: #333;
}

.login-btn:active {
  background: #000;
  border-color: #000;
}

.login-hint-text {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #8c8c8c;
}

.login-hint-text .register-link {
  color: #1a1a1a;
  font-weight: 500;
  text-decoration: none;
  margin-left: 4px;
}

.login-hint-text .register-link:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}

.login-footer p {
  font-size: 12px;
  color: #b3b3b3;
  margin: 0;
}

.login-footer .link {
  color: #1a1a1a;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
