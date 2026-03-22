<template>
  <div class="config-container">
    <div class="config-header">
      <h2>一键变身菜品图 · 功能配置</h2>
    </div>

    <div class="config-sections">
      <!-- ========== 第一步配置（识别阶段）========== -->
      <div class="config-card">
        <div class="card-header">
          <h3>第一步 · 识别配置</h3>
          <el-button type="primary" size="small" :loading="savingStep1" @click="saveStep1">
            保存
          </el-button>
        </div>

        <el-form label-width="140px" label-position="left">
          <el-form-item label="LLM 模型">
            <el-select v-model="config.model" placeholder="选择 LLM 模型" style="width: 300px">
              <el-option label="GPT-4o" value="gpt-4o" />
              <el-option label="GPT-4o-mini" value="gpt-4o-mini" />
              <el-option label="Claude-3.5-Sonnet" value="claude-3.5-sonnet" />
              <el-option label="Claude-3-Haiku" value="claude-3-haiku" />
            </el-select>
          </el-form-item>

          <el-form-item label="系统提示词">
            <el-input
              v-model="config.system_prompt"
              type="textarea"
              :rows="4"
              placeholder="输入系统提示词，用于指导 LLM 识别菜品"
            />
            <div class="form-tip">在识别任务开始前，给 LLM 的角色设定和任务说明</div>
          </el-form-item>

          <el-form-item label="用户模板">
            <el-input
              v-model="config.user_template"
              type="textarea"
              :rows="4"
              placeholder="输入用户提示词模板，支持占位符：{{dish_name}}, {{category}}, {{image_url}}"
            />
            <div class="form-tip">在拼接用户输入时使用的模板，占位符会被实际值替换</div>
          </el-form-item>

          <el-form-item label="固定后缀">
            <el-input
              v-model="config.suffix"
              type="textarea"
              :rows="2"
              placeholder="输入固定后缀，附加在提示词末尾"
            />
            <div class="form-tip">用于补充额外的控制指令，如输出格式要求等</div>
          </el-form-item>

          <el-form-item label="可编辑字段">
            <el-checkbox-group v-model="config.editable_fields">
              <el-checkbox label="dish_name">菜品名称</el-checkbox>
              <el-checkbox label="category">分类</el-checkbox>
              <el-checkbox label="tags">标签</el-checkbox>
              <el-checkbox label="description">描述</el-checkbox>
            </el-checkbox-group>
            <div class="form-tip">用户可以在识别结果中编辑哪些字段</div>
          </el-form-item>

          <el-form-item label="预览消耗积分">
            <el-input-number v-model="config.coin_cost_preview" :min="0" :controls="false" />
            <div class="form-tip">当前设置为 0，用户预览不扣积分</div>
          </el-form-item>
        </el-form>
      </div>

      <!-- ========== 第二步配置（背景匹配与生成）========== -->
      <div class="config-card">
        <div class="card-header">
          <h3>第二步 · 背景匹配与生成</h3>
          <el-button type="primary" size="small" :loading="savingStep2" @click="saveStep2">
            保存
          </el-button>
        </div>

        <el-form label-width="140px" label-position="left">
          <el-form-item label="背景图返回数量">
            <el-input-number v-model="config.background_count_x" :min="1" :max="50" />
            <div class="form-tip">向量检索返回的背景图数量，默认 10</div>
          </el-form-item>

          <el-form-item label="客户可选数量">
            <el-input-number v-model="config.select_count_max" :min="1" :max="20" />
            <div class="form-tip">客户最多可以选择多少张背景图，默认 6</div>
          </el-form-item>

          <el-form-item label="视觉生成模型">
            <el-select v-model="config.generation_model" placeholder="选择生成模型" style="width: 300px">
              <el-option label="DALL-E 3" value="dalle-3" />
              <el-option label="DALL-E 2" value="dalle-2" />
              <el-option label="Midjourney" value="midjourney" />
              <el-option label="Stable Diffusion" value="sd" />
            </el-select>
          </el-form-item>

          <el-divider>水印配置</el-divider>

          <el-form-item label="水印文字">
            <el-input v-model="config.watermark_text" placeholder="输入水印文字" style="width: 300px" />
          </el-form-item>

          <el-form-item label="水印图片">
            <div class="watermark-image-upload">
              <el-button v-if="!config.watermark_image" @click="triggerWatermarkUpload">
                上传水印图片
              </el-button>
              <div v-else class="watermark-preview">
                <img :src="config.watermark_image" alt="水印图片" />
                <el-button size="small" @click="config.watermark_image = ''">移除</el-button>
              </div>
            </div>
            <input
              ref="watermarkInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onWatermarkChange"
            />
          </el-form-item>

          <el-form-item label="水印位置">
            <div class="position-grid">
              <div
                v-for="pos in positions"
                :key="pos.value"
                class="position-cell"
                :class="{ active: config.watermark_position === pos.value }"
                @click="config.watermark_position = pos.value"
              >
                <span>{{ pos.label }}</span>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="水印透明度">
            <el-slider v-model="config.watermark_opacity" :min="0" :max="100" show-input />
          </el-form-item>
        </el-form>
      </div>

      <!-- ========== 第三步配置（消费）========== -->
      <div class="config-card">
        <div class="card-header">
          <h3>第三步 · 消费配置</h3>
          <el-button type="primary" size="small" :loading="savingStep3" @click="saveStep3">
            保存
          </el-button>
        </div>

        <el-form label-width="140px" label-position="left">
          <el-form-item label="每张图片积分">
            <el-input-number v-model="config.coin_cost_per_image" :min="0" :controls="false" />
            <div class="form-tip">客户每选中一张图片扣除的积分</div>
          </el-form-item>

          <el-form-item label="最多可选输出">
            <el-input-number v-model="config.max_select_output" :min="1" :max="10" />
            <div class="form-tip">客户最终最多可以选择多少张生成图</div>
          </el-form-item>

          <el-divider>智能高清增强</el-divider>

          <el-form-item label="高清增强积分">
            <el-input-number v-model="config.hd_enhance_coin" :min="0" :controls="false" />
            <div class="form-tip">选择高清版本时，每张图片额外扣除的积分</div>
          </el-form-item>
        </el-form>
      </div>

      <!-- ========== 背景图库管理 ========== -->
      <div class="config-card">
        <div class="card-header">
          <h3>背景图库管理</h3>
          <el-button type="primary" size="small" @click="showAddBgDialog = true">
            <el-icon><Plus /></el-icon>
            添加背景图
          </el-button>
        </div>

        <p class="config-desc">管理用于匹配的背景图片库，每张图片需要设置标签以便向量检索</p>

        <div class="bg-library-grid">
          <div v-for="bg in backgroundLibrary" :key="bg.id" class="bg-library-item">
            <img :src="bg.url" :alt="bg.tags.join(', ')" />
            <div class="bg-library-info">
              <div class="bg-tags">
                <el-tag v-for="tag in bg.tags" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
            </div>
            <div class="bg-library-actions">
              <el-button size="small" type="danger" circle @click="removeBg(bg.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加背景图弹窗 -->
    <el-dialog v-model="showAddBgDialog" title="添加背景图" width="500px">
      <el-form label-width="100px">
        <el-form-item label="背景图">
          <el-upload
            class="bg-upload"
            drag
            :auto-upload="false"
            :limit="1"
            accept="image/*"
            @change="onBgFileChange"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽图片或点击上传</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="newBgTags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
            style="width: 100%"
          >
            <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddBgDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddBg">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, UploadFilled } from '@element-plus/icons-vue'
import { uploadFile } from '@/api/oss'

const savingStep1 = ref(false)
const savingStep2 = ref(false)
const savingStep3 = ref(false)
const watermarkInputRef = ref<HTMLInputElement | null>(null)

// 配置数据
const config = reactive({
  // 第一步
  model: 'gpt-4o',
  system_prompt: '你是一个专业的菜品识别助手。请分析用户上传的菜品图片，返回详细的菜品信息。',
  user_template: '请识别这张菜品图片，返回JSON格式：\n菜品名称：{{dish_name}}\n分类：{{category}}\n标签：{{tags}}\n描述：{{description}}',
  suffix: '请用简洁的语言描述，注重色彩和摆盘。',
  editable_fields: ['dish_name', 'category', 'tags'],
  coin_cost_preview: 0,

  // 第二步
  background_count_x: 10,
  select_count_max: 6,
  generation_model: 'dalle-3',
  watermark_text: '预览水印',
  watermark_image: '',
  watermark_position: 'bottom-right',
  watermark_opacity: 50,

  // 第三步
  coin_cost_per_image: 5,
  max_select_output: 3,
  hd_enhance_coin: 5
})

const positions = [
  { value: 'top-left', label: '左上' },
  { value: 'top-center', label: '上中' },
  { value: 'top-right', label: '右上' },
  { value: 'center-left', label: '左中' },
  { value: 'center', label: '居中' },
  { value: 'center-right', label: '右中' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-center', label: '下中' },
  { value: 'bottom-right', label: '右下' }
]

// 背景图库
const backgroundLibrary = ref([
  { id: '1', url: 'https://picsum.photos/seed/bg1/400/300', tags: ['中式', '宴客', '硬菜'] },
  { id: '2', url: 'https://picsum.photos/seed/bg2/400/300', tags: ['简约', '白底', '产品图'] },
  { id: '3', url: 'https://picsum.photos/seed/bg3/400/300', tags: ['复古', '木质', '家常'] },
  { id: '4', url: 'https://picsum.photos/seed/bg4/400/300', tags: ['高级', '黑色', '宴会'] },
  { id: '5', url: 'https://picsum.photos/seed/bg5/400/300', tags: ['清新', '田园', '素雅'] },
  { id: '6', url: 'https://picsum.photos/seed/bg6/400/300', tags: ['日式', '简约', '和风'] }
])

const availableTags = ['中式', '西式', '日式', '简约', '复古', '高级', '宴客', '家常', '产品图']

// 添加背景图
const showAddBgDialog = ref(false)
const newBgTags = ref<string[]>([])
const newBgFile = ref<File | null>(null)

function triggerWatermarkUpload() {
  watermarkInputRef.value?.click()
}

async function onWatermarkChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    try {
      const res = await uploadFile(target.files[0], 'watermarks')
      config.watermark_image = res.url
      ElMessage.success('水印图片上传成功')
    } catch (error) {
      ElMessage.error('上传失败')
    }
  }
}

async function saveStep1() {
  savingStep1.value = true
  try {
    // TODO: 调用 API 保存
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('第一步配置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    savingStep1.value = false
  }
}

async function saveStep2() {
  savingStep2.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('第二步配置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    savingStep2.value = false
  }
}

async function saveStep3() {
  savingStep3.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('第三步配置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    savingStep3.value = false
  }
}

function onBgFileChange(file: any) {
  newBgFile.value = file.raw
}

async function confirmAddBg() {
  if (!newBgFile.value) {
    ElMessage.warning('请上传背景图')
    return
  }
  if (newBgTags.value.length === 0) {
    ElMessage.warning('请选择或输入标签')
    return
  }

  try {
    const res = await uploadFile(newBgFile.value, 'backgrounds')
    backgroundLibrary.value.push({
      id: `bg_${Date.now()}`,
      url: res.url,
      tags: newBgTags.value
    })
    ElMessage.success('背景图添加成功')
    showAddBgDialog.value = false
    newBgTags.value = []
    newBgFile.value = null
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

function removeBg(id: string) {
  const idx = backgroundLibrary.value.findIndex(bg => bg.id === id)
  if (idx !== -1) {
    backgroundLibrary.value.splice(idx, 1)
    ElMessage.success('背景图已移除')
  }
}

onMounted(() => {
  // TODO: 加载配置数据
})
</script>

<style scoped>
.config-container {
  padding: 0;
}

.config-header {
  margin-bottom: var(--space-xl);
}

.config-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.config-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.config-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.form-tip {
  margin-left: 8px;
  color: #8c8c8c;
  font-size: 12px;
}

.el-divider {
  margin: 20px 0;
}

/* 水印位置选择器 */
.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  gap: 4px;
  width: fit-content;
}

.position-cell {
  width: 60px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  color: var(--color-text-regular);
  transition: all 0.2s;
}

.position-cell:hover {
  border-color: var(--color-primary);
}

.position-cell.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* 水印图片上传 */
.watermark-image-upload {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.watermark-preview {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.watermark-preview img {
  height: 40px;
  width: auto;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

/* 背景图库网格 */
.config-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #8c8c8c;
}

.bg-library-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.bg-library-item {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.bg-library-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-library-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-xs);
  background: rgba(0, 0, 0, 0.6);
}

.bg-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.bg-tags .el-tag {
  font-size: 10px;
  padding: 0 4px;
  height: 18px;
  line-height: 16px;
}

.bg-library-actions {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
}

/* 响应式 */
@media (max-width: 1024px) {
  .bg-library-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .bg-library-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
