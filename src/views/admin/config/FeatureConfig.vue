<template>
  <div class="feature-config">
    <div class="config-sections">

      <!-- 公告设置 -->
      <div class="config-card">
        <h2>顶通公告</h2>
        <el-form label-width="100px">
          <el-form-item label="开启公告">
            <el-switch v-model="announcement.enabled" />
          </el-form-item>
          <el-form-item label="公告内容">
            <el-input
              v-model="announcement.content"
              type="textarea"
              :rows="2"
              placeholder="请输入公告内容"
            />
          </el-form-item>
          <el-form-item>
            <span class="form-tip">公告将显示在移动端顶部通栏</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 教程设置 -->
      <div class="config-card">
        <h2>使用教程</h2>
        <el-form label-width="100px">
          <el-form-item label="教程内容">
            <el-input
              v-model="tutorialContent"
              type="textarea"
              :rows="12"
              placeholder="请输入 Markdown 格式的教程内容"
            />
          </el-form-item>
          <el-form-item>
            <span class="form-tip">支持 Markdown 语法，将在移动端教程页面美化呈现</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 功能开关 -->
      <div class="config-card">
        <h2>功能开关</h2>
        <el-form label-width="160px">
          <el-form-item label="大师成相">
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
        <el-button @click="loadConfig">重置</el-button>
        <el-button type="primary" :loading="saving" @click="saveConfig">保存配置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncement, saveAnnouncement, getTutorial, saveTutorial } from '@/api/config'

const saving = ref(false)

// 公告配置
const announcement = ref({
  enabled: false,
  content: ''
})

// 教程内容
const tutorialContent = ref('')

// 功能开关配置
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

async function loadConfig() {
  // 加载公告配置
  const announcementConfig = await getAnnouncement()
  if (announcementConfig) {
    announcement.value = announcementConfig
  }

  // 加载教程内容
  const tutorial = await getTutorial()
  if (tutorial) {
    tutorialContent.value = tutorial
  }
}

async function saveConfig() {
  saving.value = true
  try {
    // 保存公告配置
    const annResult = await saveAnnouncement(announcement.value)
    if (!annResult) {
      throw new Error('公告配置保存失败')
    }

    // 保存教程内容
    const tutResult = await saveTutorial(tutorialContent.value)
    if (!tutResult) {
      throw new Error('教程内容保存失败')
    }

    ElMessage.success('配置保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '配置保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfig()
})
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
  gap: 12px;
}

.config-actions :deep(.el-button--primary) {
  background: #1a1a1a;
  border-color: #1a1a1a;
}

.config-actions :deep(.el-button--primary:hover) {
  background: #333;
  border-color: #333;
}

:deep(.el-textarea__inner) {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
