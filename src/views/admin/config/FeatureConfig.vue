<template>
  <div class="feature-config">
    <div class="config-sections">
      <div class="config-card">
        <h2>大师成相</h2>
        <el-form label-width="160px">
          <el-form-item label="功能开关">
            <el-switch v-model="features.masterpiece.enabled" />
          </el-form-item>
          <el-form-item label="默认审核模式">
            <el-radio-group v-model="features.masterpiece.auditMode">
              <el-radio label="auto">自动审核</el-radio>
              <el-radio label="manual">手动审核</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="每次生成数量">
            <el-input-number v-model="features.masterpiece.generateCount" :min="1" :max="9" />
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card">
        <h2>图片库</h2>
        <el-form label-width="160px">
          <el-form-item label="功能开关">
            <el-switch v-model="features.gallery.enabled" />
          </el-form-item>
          <el-form-item label="允许删除">
            <el-switch v-model="features.gallery.allowDelete" />
          </el-form-item>
          <el-form-item label="最大存储数量">
            <el-input-number v-model="features.gallery.maxStorage" :min="0" />
            <span class="form-tip">张（0 表示无限制）</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card">
        <h2>VIP 功能</h2>
        <el-form label-width="160px">
          <el-form-item label="允许自助注册">
            <el-switch v-model="features.vip.allowRegister" />
          </el-form-item>
          <el-form-item label="试用功能">
            <el-switch v-model="features.vip.trialEnabled" />
          </el-form-item>
          <el-form-item label="试用时间">
            <el-input-number v-model="features.vip.trialDays" :min="0" :max="30" />
            <span class="form-tip">天</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="config-actions">
        <el-button type="primary" @click="saveConfig">保存配置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const features = ref({
  masterpiece: {
    enabled: true,
    auditMode: 'auto',
    generateCount: 4
  },
  gallery: {
    enabled: true,
    allowDelete: true,
    maxStorage: 0
  },
  vip: {
    allowRegister: true,
    trialEnabled: true,
    trialDays: 7
  }
})

function saveConfig() {
  ElMessage.success('配置保存成功')
}
</script>

<style scoped>
.feature-config {
  padding: 0;
}

.config-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #f0f0f0;
}

.config-card h2 {
  margin: 0 0 20px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.form-tip {
  margin-left: 8px;
  color: #8c8c8c;
  font-size: 13px;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
}

.config-actions :deep(.el-button--primary) {
  background: #1a1a1a;
  border-color: #1a1a1a;
}

.config-actions :deep(.el-button--primary:hover) {
  background: #333;
  border-color: #333;
}
</style>
