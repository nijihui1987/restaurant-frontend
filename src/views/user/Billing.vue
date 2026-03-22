<template>
  <div class="billing-page">
    <header class="page-header">
      <h1>账单查询</h1>
    </header>
    <main class="page-content">
      <el-empty description="账单查询功能开发中" />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.billing-page {
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
  margin: 0;
}

.page-content {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
}
</style>
