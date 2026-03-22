<template>
  <div class="customers-page">
    <header class="page-header">
      <h1>客户管理</h1>
      <p class="page-desc">查看所属下级用户的图片和任务</p>
    </header>
    <main class="page-content">
      <el-empty description="客户管理功能开发中" />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.customers-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs);
}

.page-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.page-content {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
}
</style>
