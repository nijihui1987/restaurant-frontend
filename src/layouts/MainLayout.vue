<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="logo">餐饮视觉工作台</div>
      <nav>
        <router-link to="/">首页</router-link>
      </nav>
    </aside>
    <main class="main-content">
      <header class="header">
        <span>{{ userStore.userInfo?.username }}</span>
        <el-button size="small" @click="handleLogout">退出</el-button>
      </header>
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

async function handleLogout() {
  await ElMessageBox.confirm('确定退出登录？', '提示', {
    type: 'warning'
  })
  await userStore.logout()
  ElMessage.success('已退出')
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background: #304156;
  color: white;
  position: fixed;
  height: 100vh;
}

.logo {
  padding: 20px;
  font-weight: 600;
  border-bottom: 1px solid #263445;
}

nav a {
  display: block;
  padding: 12px 20px;
  color: #bfcbd9;
  text-decoration: none;
}

nav a:hover,
nav a.router-link-active {
  background: #263445;
  color: white;
}

.main-content {
  flex: 1;
  margin-left: 200px;
}

.header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  gap: 16px;
}

.content {
  padding: 20px;
}
</style>