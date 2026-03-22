<template>
  <div class="mobile-profile">
    <header class="page-header">
      <h1>个人信息</h1>
    </header>

    <main class="profile-content">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-wrapper" @click="changeAvatar">
            <img :src="avatarUrl" alt="头像" class="avatar-img" />
            <div class="avatar-edit">
              <el-icon :size="14"><Camera /></el-icon>
            </div>
          </div>
          <div class="profile-info">
            <h2 class="username">{{ userStore.userInfo?.username }}</h2>
            <span class="role-tag">{{ userStore.roleName }}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span class="info-label">显示名称</span>
            <span class="info-value">{{ userStore.userInfo?.anonymous_name || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">真实姓名</span>
            <span class="info-value">{{ userStore.userInfo?.real_name || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">公司名称</span>
            <span class="info-value">{{ userStore.userInfo?.company_name || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">职位</span>
            <span class="info-value">{{ userStore.userInfo?.position || '未设置' }}</span>
          </div>
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

      <div class="action-card">
        <div class="action-item" @click="editProfile">
          <div class="action-left">
            <el-icon :size="20"><Edit /></el-icon>
            <span>编辑资料</span>
          </div>
          <el-icon :size="18" class="action-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="action-item" @click="changePassword">
          <div class="action-left">
            <el-icon :size="20"><Lock /></el-icon>
            <span>修改密码</span>
          </div>
          <el-icon :size="18" class="action-arrow"><ArrowRight /></el-icon>
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Edit, Lock, Camera, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const avatarUrl = computed(() => {
  return userStore.userInfo?.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="%23e6e6e6" cx="50" cy="50" r="50"/></svg>'
})

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function changeAvatar() {
  ElMessage.info('头像上传功能开发中')
}

function editProfile() {
  ElMessage.info('编辑资料功能开发中')
}

function changePassword() {
  ElMessage.info('修改密码功能开发中')
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

.back-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
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
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 10px;
  padding: 4px;
  text-align: center;
  border-radius: 0 0 32px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
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

.action-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.action-item:active {
  background: #fafbfc;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #1a1a1a;
}

.action-left .el-icon {
  color: #595959;
}

.action-arrow {
  color: #d9d9d9;
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
