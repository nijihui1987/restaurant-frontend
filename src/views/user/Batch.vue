<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">批量套图成片</h1>
      <p class="page-desc">一次上传多张图片，批量处理成专业营销素材</p>
    </div>
    <div class="placeholder-content">
      <el-empty description="功能开发中，敬请期待" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page-container {
  max-width: 1200px;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.page-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.placeholder-content {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  border: 1px solid var(--border-light);
}
</style>
