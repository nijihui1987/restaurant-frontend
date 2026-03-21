<template>
  <div class="maintenance">
    <div class="maintenance-grid">
      <div class="maintenance-card">
        <div class="card-icon">
          <el-icon :size="32"><Refresh /></el-icon>
        </div>
        <h3>数据备份</h3>
        <p>备份所有用户数据和图片索引</p>
        <el-button @click="backupData">执行备份</el-button>
      </div>

      <div class="maintenance-card">
        <div class="card-icon">
          <el-icon :size="32"><Delete /></el-icon>
        </div>
        <h3>清理缓存</h3>
        <p>清理过期缓存文件和临时数据</p>
        <el-button @click="clearCache">清理缓存</el-button>
      </div>

      <div class="maintenance-card">
        <div class="card-icon">
          <el-icon :size="32"><DataLine /></el-icon>
        </div>
        <h3>重建索引</h3>
        <p>重建向量数据库索引</p>
        <el-button @click="rebuildIndex">重建索引</el-button>
      </div>

      <div class="maintenance-card">
        <div class="card-icon">
          <el-icon :size="32"><Document /></el-icon>
        </div>
        <h3>操作日志</h3>
        <p>查看系统操作日志</p>
        <el-button @click="viewLogs">查看日志</el-button>
      </div>
    </div>

    <div class="system-status">
      <h2>系统状态</h2>
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">CPU 使用率</span>
          <span class="status-value">{{ systemStatus.cpu }}%</span>
        </div>
        <div class="status-item">
          <span class="status-label">内存使用率</span>
          <span class="status-value">{{ systemStatus.memory }}%</span>
        </div>
        <div class="status-item">
          <span class="status-label">磁盘使用率</span>
          <span class="status-value">{{ systemStatus.disk }}%</span>
        </div>
        <div class="status-item">
          <span class="status-label">服务状态</span>
          <el-tag :type="systemStatus.service === 'running' ? 'success' : 'danger'" size="small">
            {{ systemStatus.service === 'running' ? '运行中' : '异常' }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Delete, DataLine, Document } from '@element-plus/icons-vue'

const systemStatus = ref({
  cpu: 45,
  memory: 62,
  disk: 38,
  service: 'running'
})

function backupData() {
  ElMessage.info('数据备份功能开发中')
}

function clearCache() {
  ElMessage.info('清理缓存功能开发中')
}

function rebuildIndex() {
  ElMessage.info('重建索引功能开发中')
}

function viewLogs() {
  ElMessage.info('查看日志功能开发中')
}
</script>

<style scoped>
.maintenance {
  padding: 0;
}

.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.maintenance-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  border: 1px solid #f0f0f0;
}

.card-icon {
  width: 56px;
  height: 56px;
  background: #fafbfc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #1a1a1a;
}

.maintenance-card h3 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.maintenance-card p {
  margin: 0 0 16px;
  font-size: 13px;
  color: #8c8c8c;
}

.system-status {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #f0f0f0;
}

.system-status h2 {
  margin: 0 0 20px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-label {
  font-size: 13px;
  color: #8c8c8c;
}

.status-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}
</style>
