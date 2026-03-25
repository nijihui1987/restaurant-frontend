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
  padding: var(--space-lg) var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border-light);
}

.page-header h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.profile-content {
  padding: var(--space-xl);
  max-width: 480px;
  margin: 0 auto;
}

.profile-card {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  margin-bottom: var(--space-lg);
  border: 1px solid var(--border-light);
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--border-light);
}

.profile-info {
  flex: 1;
}

.contact-btn {
  background: var(--bg-hover);
  border: 1px solid var(--border-default);
  color: var(--color-text-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  padding: var(--space-sm) var(--space-lg);
  height: auto;
  transition: all var(--transition-fast);
}

.contact-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.username {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
  letter-spacing: -0.02em;
}

.role-tag {
  display: inline-block;
  background: rgba(196, 149, 106, 0.15);
  color: var(--color-accent);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.balance-section {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.balance-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.balance-icon {
  width: 44px;
  height: 44px;
  background: rgba(196, 149, 106, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.balance-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.balance-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-accent);
  font-family: 'SF Mono', Monaco, monospace;
  letter-spacing: -0.02em;
}

.recharge-btn {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0a0a;
  border-radius: var(--radius-full);
  min-width: 80px;
  height: 40px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.recharge-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 149, 106, 0.3);
}

.info-section {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg) 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid var(--border-light);
}

.info-label {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 500;
}

.logout-section {
  padding: var(--space-sm) 0;
}

.admin-btn {
  width: 100%;
  height: 52px;
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-xl);
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  letter-spacing: 0.02em;
  transition: all var(--transition-normal);
}

.admin-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(196, 149, 106, 0.25);
}

.logout-btn {
  width: 100%;
  height: 52px;
  font-size: var(--font-size-base);
  font-weight: 600;
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.logout-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

/* 联系作者弹窗 */
.contact-dialog :deep(.el-dialog) {
  background: var(--bg-surface) !important;
  border-radius: var(--radius-xl);
  max-width: 90vw;
  border: 1px solid var(--border-light);
}

.contact-dialog :deep(.el-dialog__header) {
  padding: var(--space-xl);
  border-bottom: 1px solid var(--border-light);
}

.contact-dialog :deep(.el-dialog__title) {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.contact-dialog :deep(.el-dialog__body) {
  padding: var(--space-xl);
  max-height: 60vh;
  overflow-y: auto;
}

.contact-content {
  font-size: var(--font-size-base);
  line-height: 1.7;
  color: var(--color-text-regular);
}

.contact-content :deep(h1) {
  font-size: var(--font-size-xl);
  margin: 0 0 var(--space-lg);
  color: var(--color-text-primary);
  font-weight: 700;
}

.contact-content :deep(h2) {
  font-size: var(--font-size-lg);
  margin: var(--space-xl) 0 var(--space-md);
  color: var(--color-text-primary);
  font-weight: 600;
}

.contact-content :deep(p) {
  margin: 0 0 var(--space-md);
}

.contact-content :deep(ul),
.contact-content :deep(ol) {
  padding-left: var(--space-xl);
  margin: 0 0 var(--space-md);
}

.contact-content :deep(li) {
  margin-bottom: var(--space-xs);
}

.contact-content :deep(code) {
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-accent);
}

.contact-content :deep(a) {
  color: var(--color-accent);
}
</style>
