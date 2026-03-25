<template>
  <div class="mobile-profile">
    <header class="page-header">
      <h1>个人信息</h1>
    </header>

    <main class="profile-content">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-info">
            <h2 class="username">{{ userStore.userInfo?.username }}</h2>
            <span class="role-tag">{{ userStore.roleName }}</span>
          </div>
        </div>

        <div class="balance-section">
          <div class="balance-item">
            <div class="balance-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div class="balance-info">
              <span class="balance-label">账户余额</span>
              <span class="balance-value">{{ balance.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ userStore.userInfo?.phone || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userStore.userInfo?.email || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">注册时间</span>
            <span class="info-value">{{ formatDate(userStore.userInfo?.created_at) }}</span>
          </div>
        </div>
      </div>

      <div class="logout-section" v-if="userStore.canAccessAdmin">
        <el-button type="primary" size="large" @click="goToAdmin" class="admin-btn">
          <el-icon :size="18"><Setting /></el-icon>
          进入管理后台
        </el-button>
      </div>

      <div class="logout-section">
        <el-button type="danger" plain size="large" @click="handleLogout" class="logout-btn">
          退出登录
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { getBalance } from '@/api/billing'

const router = useRouter()
const userStore = useUserStore()

const balance = ref(0)

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

async function loadBalance() {
  const data = await getBalance()
  if (data) {
    balance.value = data.balance
  }
}

function goToAdmin() {
  router.push('/dashboard')
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定退出登录？', '提示', { type: 'warning' })
    await userStore.logout()
    ElMessage.success('已退出')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadBalance()
})
</script>

<style scoped>
.mobile-profile {
  min-height: 100vh;
  background: #fafbfc;
}

.page-header {
  background: #ffffff;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 #f0f0f0;
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.profile-content {
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.profile-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
}

.profile-header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px;
}

.role-tag {
  display: inline-block;
  background: #f0f0f0;
  color: #595959;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.balance-section {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.balance-label {
  font-size: 12px;
  color: #8c8c8c;
}

.balance-value {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  font-family: 'SF Mono', Monaco, monospace;
}

.info-section {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid #fafafa;
}

.info-label {
  font-size: 14px;
  color: #8c8c8c;
}

.info-value {
  font-size: 14px;
  color: #1a1a1a;
}

.logout-section {
  padding: 8px 0;
}

.admin-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  border-radius: 24px;
  background: #1a1a1a;
  border-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.admin-btn:hover {
  background: #333333;
  border-color: #333333;
}

.logout-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  border-radius: 24px;
  background: #ffffff;
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.logout-btn:hover {
  background: #fff1f0;
  border-color: #ff7875;
  color: #ff7875;
}
</style>
