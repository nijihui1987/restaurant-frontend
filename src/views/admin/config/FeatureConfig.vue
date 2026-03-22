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
      <div class="config-card feature-config-card">
        <div class="card-header">
          <h2>功能显示管理</h2>
          <el-button type="primary" size="small" :loading="savingFeaturesAll" @click="saveAllFeatures">
            保存全部
          </el-button>
        </div>
        <p class="config-desc">拖拽排序调整顺序，点击保存全部</p>

        <!-- 表头 -->
        <div class="feature-table-header">
          <div class="col-drag"></div>
          <div class="col-preview">预览</div>
          <div class="col-title">标题 / 描述 / 路径 / 图片链接</div>
          <div class="col-action-btn">按钮文字</div>
          <div class="col-status">状态</div>
          <div class="col-blocked">遮挡文字</div>
          <div class="col-user">用户</div>
          <div class="col-vip">VIP</div>
          <div class="col-coin">积分</div>
          <div class="col-action">操作</div>
        </div>

        <!-- 功能列表 -->
        <draggable
          v-model="featureStore.features"
          item-key="id"
          handle=".feature-drag"
          @end="onDragEnd"
          class="feature-table-body"
        >
          <template #item="{ element: feature }">
            <div class="feature-row">
              <div class="col-drag">
                <el-icon class="drag-icon feature-drag" :size="16"><Rank /></el-icon>
              </div>
              <div class="col-preview">
                <img :src="feature.image" :alt="feature.title" class="preview-img" />
              </div>
              <div class="col-title">
                <el-input v-model="feature.title" size="small" placeholder="功能名称" />
                <el-input v-model="feature.desc" size="small" placeholder="功能描述" class="desc-input" />
                <el-input v-model="feature.path" size="small" placeholder="路由路径，如 /masterpiece" class="path-input" />
                <el-input v-model="feature.image" size="small" placeholder="图片链接" class="image-url-input" />
              </div>
              <div class="col-action-btn">
                <el-input v-model="feature.actionText" size="small" placeholder="进入" />
              </div>
              <div class="col-status">
                <el-select v-model="feature.status" size="small">
                  <el-option label="正常" value="enabled" />
                  <el-option label="遮挡" value="blocked" />
                  <el-option label="隐藏" value="hidden" />
                </el-select>
              </div>
              <div class="col-blocked">
                <el-input
                  v-model="feature.blockedText"
                  size="small"
                  placeholder="即将上线"
                  :disabled="feature.status !== 'blocked'"
                />
              </div>
              <div class="col-user">
                <el-switch v-model="feature.showInUserList" size="small" />
              </div>
              <div class="col-vip">
                <el-switch v-model="feature.showInVipList" size="small" />
              </div>
              <div class="col-coin">
                <el-input-number v-model="feature.coinCost" size="small" :min="0" :controls="false" placeholder="0" />
              </div>
              <div class="col-action">
                <el-button type="danger" size="small" circle @click="removeFeature(feature.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </draggable>

        <div class="add-feature">
          <el-button type="primary" plain @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            添加功能
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加功能弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加功能"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="newFeatureForm" label-width="100px">
        <el-form-item label="功能标题" required>
          <el-input v-model="newFeatureForm.title" placeholder="如：手机随拍成片" />
        </el-form-item>
        <el-form-item label="功能描述">
          <el-input v-model="newFeatureForm.desc" type="textarea" :rows="2" placeholder="功能简短描述" />
        </el-form-item>
        <el-form-item label="路由路径" required>
          <el-input v-model="newFeatureForm.path" placeholder="如：/masterpiece" />
          <div class="path-tips">
            <span class="path-tips-title">已有路由：</span>
            <span class="path-tag" v-for="route in availableRoutes" :key="route.path" @click="newFeatureForm.path = route.path">
              {{ route.path }}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="图片链接">
          <el-input v-model="newFeatureForm.image" placeholder="https://..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddFeature">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { getAnnouncement, saveAnnouncement as saveAnnouncementApi, getTutorial, saveTutorial as saveTutorialApi } from '@/api/config'
import { useFeatureStore } from '@/stores/feature'
import { Rank, Delete, Plus } from '@element-plus/icons-vue'

const savingAnnouncement = ref(false)
const savingTutorial = ref(false)
const savingFeaturesAll = ref(false)
const featureStore = useFeatureStore()

// 添加功能弹窗
const addDialogVisible = ref(false)
const newFeatureForm = ref({
  title: '',
  desc: '',
  path: '',
  image: 'https://picsum.photos/seed/new/600/300'
})

// 可用的路由列表（供管理员参考）
const availableRoutes = [
  { path: '/masterpiece', name: '手机随拍成片' },
  { path: '/batch', name: '批量套图成片' },
  { path: '/enhance', name: '智能高清优化' },
  { path: '/wechat', name: '微信营销出图' },
  { path: '/dianping', name: '大众点评装修' },
  { path: '/douyin', name: '抖音门店装修' },
  { path: '/menu', name: '印刷菜单出图' }
]

function showAddDialog() {
  newFeatureForm.value = {
    title: '',
    desc: '',
    path: '',
    image: 'https://picsum.photos/seed/new/600/300'
  }
  addDialogVisible.value = true
}

function confirmAddFeature() {
  if (!newFeatureForm.value.title.trim()) {
    ElMessage.warning('请输入功能标题')
    return
  }
  if (!newFeatureForm.value.path.trim()) {
    ElMessage.warning('请输入路由路径')
    return
  }
  if (!newFeatureForm.value.path.startsWith('/')) {
    ElMessage.warning('路由路径必须以 / 开头')
    return
  }
  const newId = `feature_${Date.now()}`
  featureStore.addFeature({
    id: newId,
    path: newFeatureForm.value.path,
    title: newFeatureForm.value.title,
    desc: newFeatureForm.value.desc || '功能描述',
    image: newFeatureForm.value.image,
    status: 'enabled',
    order: featureStore.features.length + 1,
    showInUserList: true,
    showInVipList: true,
    blockedText: '即将上线'
  })
  addDialogVisible.value = false
  ElMessage.success('功能添加成功，请点击"保存全部"提交')
}

function onDragEnd() {
  // 更新排序号
  featureStore.features.forEach((feature, index) => {
    feature.order = index + 1
  })
}

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
  // 验证：开启时内容不能为空
  if (announcement.value.enabled && !announcement.value.content.trim()) {
    ElMessage.warning('开启公告时，内容不能为空')
    return
  }
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

/* 功能列表 - 表格布局 */
.feature-config-card {
  overflow: visible;
}

.feature-table-header {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.feature-table-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-row {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.feature-row:hover {
  border-color: #dcdfe6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 拖拽时的样式 */
.sortable-ghost {
  opacity: 0.5;
  background: #e6f7ff;
  border: 1px dashed #1890ff !important;
}

.sortable-chosen {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 列宽设置 */
.col-drag {
  width: 32px;
  flex-shrink: 0;
}

.col-preview {
  width: 80px;
  flex-shrink: 0;
  margin-right: 12px;
}

.col-title {
  flex: 1;
  min-width: 120px;
  margin-right: 12px;
}

.col-action-btn {
  width: 80px;
  flex-shrink: 0;
  margin-right: 12px;
}

.col-status {
  width: 100px;
  flex-shrink: 0;
  margin-right: 12px;
}

.col-blocked {
  width: 100px;
  flex-shrink: 0;
  margin-right: 12px;
}

.col-user {
  width: 60px;
  flex-shrink: 0;
  text-align: center;
}

.col-vip {
  width: 60px;
  flex-shrink: 0;
  text-align: center;
}

.col-coin {
  width: 70px;
  flex-shrink: 0;
  text-align: center;
}

.col-action {
  width: 40px;
  flex-shrink: 0;
  text-align: center;
}

/* 拖拽图标 */
.drag-icon {
  cursor: grab;
  color: #999;
  transition: color 0.2s;
}

.drag-icon:hover {
  color: #666;
}

.drag-icon:active {
  cursor: grabbing;
}

/* 预览图 */
.preview-img {
  width: 80px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
}

/* 添加功能按钮 */
.add-feature {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.image-url-input {
  margin-top: 6px;
}

.desc-input {
  margin-top: 6px;
}

.path-input {
  margin-top: 6px;
}

.path-tips {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.path-tips-title {
  font-size: 12px;
  color: #8c8c8c;
}

.path-tag {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.path-tag:hover {
  background: #e6f7ff;
  color: #1890ff;
}

:deep(.el-textarea__inner) {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
