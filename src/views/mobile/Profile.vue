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
          <el-button @click="showContactDialog" class="contact-btn">联系作者</el-button>
        </div>

        <div class="balance-section">
          <div class="balance-left">
            <div class="balance-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div class="balance-info">
              <span class="balance-label">账户余额</span>
              <span class="balance-value">{{ Math.round(balance) }}</span>
            </div>
          </div>
          <el-button size="small" @click="showRechargeTip" class="recharge-btn">充值</el-button>
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

    <!-- 联系作者弹窗 -->
    <el-dialog
      v-model="contactDialogVisible"
      title="联系作者"
      width="90%"
      class="contact-dialog"
    >
      <div class="contact-content markdown-body" v-html="renderedContact"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { getBalance } from '@/api/billing'
import { getConfig } from '@/api/config'
import { marked } from 'marked'

const router = useRouter()
const userStore = useUserStore()

const balance = ref(0)
const contactDialogVisible = ref(false)
const contactContent = ref('')
const renderedContact = ref('')

async function loadContactContent() {
  const content = await getConfig('system', 'contact-author')
  if (content) {
    contactContent.value = content
    renderedContact.value = await marked.parse(content)
  } else {
    contactContent.value = '暂无联系方式'
    renderedContact.value = '<p>暂无联系方式</p>'
  }
}

async function showContactDialog() {
  await loadContactContent()
  contactDialogVisible.value = true
}

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

function showRechargeTip() {
  ElMessageBox.alert('内测期间充值请联系管理员', '提示', {
    confirmButtonText: '知道了'
  }).catch(() => {})
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
  background: var(--bg-page);
}

.page-header {
  background: var(--bg-surface);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 var(--border-light);
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.profile-content {
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.profile-card {
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}

.profile-info {
  flex: 1;
}

.contact-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  color: var(--color-text-regular);
  border-radius: 16px;
  font-size: 15px;
  padding: 10px 20px;
  height: auto;
}

.contact-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}

.role-tag {
  display: inline-block;
  background: var(--bg-hover);
  color: var(--color-text-regular);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.balance-section {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.balance-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.balance-icon {
  width: 36px;
  height: 36px;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.balance-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.balance-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: 'SF Mono', Monaco, monospace;
}

.recharge-btn {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--bg-surface);
  border-radius: 8px;
  min-width: 70px;
  height: 36px;
  font-size: 14px;
}

.recharge-btn:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
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
  border-bottom: 1px solid var(--bg-page);
}

.info-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--color-text-primary);
}

.logout-section {
  padding: 8px 0;
}

.admin-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  border-radius: 24px;
  background: var(--color-primary);
  border-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.admin-btn:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.logout-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  border-radius: 24px;
  background: var(--bg-surface);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.logout-btn:hover {
  background: var(--color-danger-bg);
  border-color: var(--color-danger-hover);
  color: var(--color-danger-hover);
}

/* 联系作者弹窗 */
.contact-dialog :deep(.el-dialog) {
  border-radius: 16px;
  max-width: 90vw;
}

.contact-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.contact-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.contact-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.contact-content {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-regular);
}

.contact-content :deep(h1) {
  font-size: 18px;
  margin: 0 0 16px;
  color: var(--color-text-primary);
}

.contact-content :deep(h2) {
  font-size: 16px;
  margin: 16px 0 12px;
  color: var(--color-text-primary);
}

.contact-content :deep(p) {
  margin: 0 0 12px;
}

.contact-content :deep(ul),
.contact-content :deep(ol) {
  padding-left: 20px;
  margin: 0 0 12px;
}

.contact-content :deep(li) {
  margin-bottom: 4px;
}

.contact-content :deep(code) {
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.contact-content :deep(a) {
  color: var(--el-color-primary);
}
</style>
