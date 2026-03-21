<template>
  <div class="system-config">
    <div class="config-sections">
      <div class="config-card">
        <h2>LLM 配置</h2>
        <el-form label-width="160px">
          <el-form-item label="火山引擎 API Key">
            <el-input type="password" v-model="config.volcApiKey" placeholder="请输入" show-password />
          </el-form-item>
          <el-form-item label="Dashscope API Key">
            <el-input type="password" v-model="config.dashscopeApiKey" placeholder="请输入" show-password />
          </el-form-item>
          <el-form-item label="MiniMax API Key">
            <el-input type="password" v-model="config.minimaxApiKey" placeholder="请输入" show-password />
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card">
        <h2>OSS 配置</h2>
        <el-form label-width="160px">
          <el-form-item label="阿里云 AccessKey">
            <el-input v-model="config.ossAccessKey" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="阿里云 SecretKey">
            <el-input type="password" v-model="config.ossSecretKey" placeholder="请输入" show-password />
          </el-form-item>
          <el-form-item label="OSS Bucket">
            <el-input v-model="config.ossBucket" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="OSS Endpoint">
            <el-input v-model="config.ossEndpoint" placeholder="请输入" />
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card">
        <h2>系统参数</h2>
        <el-form label-width="160px">
          <el-form-item label="Token 有效期">
            <el-input-number v-model="config.tokenExpireHours" :min="1" :max="72" />
            <span class="form-tip">小时</span>
          </el-form-item>
          <el-form-item label="最大上传大小">
            <el-input-number v-model="config.maxUploadSize" :min="1" :max="100" />
            <span class="form-tip">MB</span>
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

const config = ref({
  volcApiKey: '',
  dashscopeApiKey: '',
  minimaxApiKey: '',
  ossAccessKey: '',
  ossSecretKey: '',
  ossBucket: '',
  ossEndpoint: '',
  tokenExpireHours: 1,
  maxUploadSize: 20
})

function saveConfig() {
  ElMessage.success('配置保存成功')
}
</script>

<style scoped>
.system-config {
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
