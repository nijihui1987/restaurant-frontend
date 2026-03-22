<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">微信营销出图</h1>
      <p class="page-desc">生成适合微信分享的高质量营销图片</p>
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
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.page-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.placeholder-content {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
}
</style>
