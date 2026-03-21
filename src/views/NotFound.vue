<template>
  <div class="not-found">
    <div class="content">
      <span class="icon">🔍</span>
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.content {
  text-align: center;
}

.icon {
  font-size: 80px;
  display: block;
  margin-bottom: 20px;
}

h1 {
  margin: 0 0 16px;
  font-size: 80px;
  color: #333;
}

p {
  margin: 0 0 24px;
  font-size: 16px;
  color: #666;
}
</style>