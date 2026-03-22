<template>
  <div class="feature-config">
    <div class="config-sections">

      <!-- 公告设置 -->
      <div class="config-card">
        <div class="card-header">
          <h2>顶通公告</h2>
          <el-button type="primary" size="small" :loading="savingAnnouncement" @click="saveAnnouncement">
            保存
          </el-button>
        </div>
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
        <div class="card-header">
          <h2>使用教程</h2>
          <el-button type="primary" size="small" :loading="savingTutorial" @click="saveTutorialContent">
            保存
          </el-button>
        </div>
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

      <!-- 功能显示管理 -->
      <div class="config-card">
        <div class="card-header">
          <h2>功能显示管理</h2>
          <el-button type="primary" size="small" :loading="savingFeaturesAll" @click="saveAllFeatures">
            保存全部
          </el-button>
        </div>
        <p class="config-desc">拖拽排序，调整功能显示状态、内容及列表可见性</p>

        <div class="feature-list">
          <div
            v-for="feature in featureStore.features"
            :key="feature.id"
            class="feature-item"
          >
            <div class="feature-drag">
              <el-icon :size="16"><Rank /></el-icon>
            </div>
            <div class="feature-preview">
              <img :src="feature.image" :alt="feature.title" class="preview-img" />
            </div>
            <div class="feature-form">
              <el-form label-width="80px" size="small">
                <el-form-item label="标题">
                  <el-input v-model="feature.title" style="width: 160px" />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="feature.status" style="width: 120px">
                    <el-option label="正常" value="enabled" />
                    <el-option label="遮挡" value="blocked" />
                    <el-option label="隐藏" value="hidden" />
                  </el-select>
                </el-form-item>
                <el-form-item label="描述">
                  <el-input v-model="feature.desc" type="textarea" :rows="2" style="width: 200px" />
                </el-form-item>
                <el-form-item label="图片URL">
                  <el-input v-model="feature.image" style="width: 200px" />
                </el-form-item>
                <el-form-item label="用户列表">
                  <el-switch v-model="feature.showInUserList" />
                </el-form-item>
                <el-form-item label="VIP列表">
                  <el-switch v-model="feature.showInVipList" />
                </el-form-item>
              </el-form>
            </div>
            <div class="feature-actions">
              <el-button type="danger" size="small" circle @click="removeFeature(feature.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="add-feature">
          <el-button type="primary" plain @click="addNewFeature">
            <el-icon><Plus /></el-icon>
            添加功能
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncement, saveAnnouncement as saveAnnouncementApi, getTutorial, saveTutorial as saveTutorialApi } from '@/api/config'
import { useFeatureStore } from '@/stores/feature'
import { Rank, Delete, Plus } from '@element-plus/icons-vue'

const savingAnnouncement = ref(false)
const savingTutorial = ref(false)
const savingFeaturesAll = ref(false)
const featureStore = useFeatureStore()

// 公告配置
const announcement = ref({
  enabled: false,
  content: ''
})

// 教程内容
const tutorialContent = ref('')

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

  // 加载功能配置
  await featureStore.loadFeatures()
}

async function saveAnnouncement() {
  savingAnnouncement.value = true
  try {
    const result = await saveAnnouncementApi(announcement.value)
    if (!result) {
      throw new Error('保存失败')
    }
    ElMessage.success('公告保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    savingAnnouncement.value = false
  }
}

async function saveTutorialContent() {
  savingTutorial.value = true
  try {
    const result = await saveTutorialApi(tutorialContent.value)
    if (!result) {
      throw new Error('保存失败')
    }
    ElMessage.success('教程保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    savingTutorial.value = false
  }
}

async function saveAllFeatures() {
  savingFeaturesAll.value = true
  try {
    const result = await featureStore.saveFeatureConfig()
    if (!result) {
      throw new Error('保存失败')
    }
    ElMessage.success('功能配置保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    savingFeaturesAll.value = false
  }
}

function removeFeature(id: string) {
  featureStore.removeFeature(id)
}

function addNewFeature() {
  const newId = `feature_${Date.now()}`
  featureStore.addFeature({
    id: newId,
    path: `/${newId}`,
    title: '新功能',
    desc: '功能描述',
    image: 'https://picsum.photos/seed/new/600/300',
    status: 'enabled',
    order: featureStore.features.length + 1,
    showInUserList: true,
    showInVipList: true
  })
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
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0;
}

.config-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #8c8c8c;
}

.form-tip {
  margin-left: 8px;
  color: #8c8c8c;
  font-size: 13px;
}

/* 功能列表 */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.feature-drag {
  padding: 8px 4px;
  cursor: grab;
  color: #999;
}

.feature-drag:active {
  cursor: grabbing;
}

.feature-preview {
  width: 80px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-form {
  flex: 1;
}

.feature-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.feature-form :deep(.el-form-item__label) {
  font-size: 12px;
  color: #666;
}

.feature-actions {
  padding: 8px 0;
}

.add-feature {
  margin-top: 12px;
}

:deep(.el-textarea__inner) {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
