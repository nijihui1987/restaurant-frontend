<template>
  <div class="config-container">
    <div class="config-header">
      <h2>一键变身菜品图 · 功能配置</h2>
    </div>

    <div class="config-sections">
      <!-- ========== 页面配置 ========== -->
      <div class="config-card">
        <div class="card-header">
          <h3>页面配置</h3>
          <el-button type="primary" size="small" :loading="savingStep1" @click="saveStep1">
            保存
          </el-button>
        </div>

        <el-form label-width="140px" label-position="left">
          <el-form-item label="功能副标题">
            <el-input
              v-model="config.subtitle"
              placeholder="输入功能副标题，显示在大标题下方"
            />
            <div class="form-tip">留空则不显示副标题</div>
          </el-form-item>
        </el-form>
      </div>

      <!-- ========== 第一步配置（识别阶段）========== -->
      <div class="config-card">
        <div class="card-header">
          <h3>第一步 · 识别配置</h3>
        </div>

        <el-form label-width="140px" label-position="left">
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
              :rows="10"
              placeholder="输入用户提示词模板"
            />
            <div class="form-tip">在拼接用户输入时使用的模板</div>
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
              <el-checkbox label="business_type">所属业态</el-checkbox>
              <el-checkbox label="cuisine_type">所属菜系</el-checkbox>
              <el-checkbox label="main_ingredients">主要原材料</el-checkbox>
              <el-checkbox label="cooking_method">主要做法</el-checkbox>
              <el-checkbox label="description">整体详细描述</el-checkbox>
              <el-checkbox label="photo_tips">摄影建议</el-checkbox>
            </el-checkbox-group>
            <div class="form-tip">用户可以在识别结果中编辑哪些字段</div>
          </el-form-item>

          <el-form-item label="显示字段">
            <el-checkbox-group v-model="config.visible_fields">
              <el-checkbox label="dish_name">菜品名称</el-checkbox>
              <el-checkbox label="business_type">所属业态</el-checkbox>
              <el-checkbox label="cuisine_type">所属菜系</el-checkbox>
              <el-checkbox label="main_ingredients">主要原材料</el-checkbox>
              <el-checkbox label="cooking_method">主要做法</el-checkbox>
              <el-checkbox label="description">整体详细描述</el-checkbox>
              <el-checkbox label="photo_tips">摄影建议</el-checkbox>
            </el-checkbox-group>
            <div class="form-tip">哪些字段显示给客户看</div>
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

          <el-form-item label="显示图片名称">
            <el-switch v-model="config.show_background_name" />
            <div class="form-tip">在背景图左下角显示文件名</div>
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

      <!-- ========== 防恶意提交（速率限制）========== -->
      <div class="config-card">
        <div class="card-header">
          <h3>防恶意提交（速率限制）</h3>
          <el-button type="primary" size="small" :loading="savingRateLimit" @click="saveRateLimit">
            保存
          </el-button>
        </div>

        <el-form label-width="140px" label-position="left">
          <el-form-item label="时间窗口">
            <el-input-number v-model="rateLimit.window_seconds" :min="60" :max="3600" :step="60" controls-position="right" />
            <div class="form-tip">单位：秒，范围 60-3600</div>
          </el-form-item>

          <el-form-item label="最大尝试次数">
            <el-input-number v-model="rateLimit.max_attempts" :min="1" :max="10" controls-position="right" />
            <div class="form-tip">范围 1-10</div>
          </el-form-item>

          <el-form-item label="阻止时间">
            <el-input-number v-model="rateLimit.block_seconds" :min="60" :max="7200" :step="60" controls-position="right" />
            <div class="form-tip">单位：秒，范围 60-7200</div>
          </el-form-item>

          <el-form-item>
            <div class="form-tip">规则：在时间窗口内失败达到最大尝试次数后，将被阻止指定时间</div>
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
import { getConfig, updateConfig } from '@/api/masterpiece'
import { getRateLimitConfig, updateRateLimitConfig, type RateLimitConfig } from '@/api/config'

const savingStep1 = ref(false)
const savingStep2 = ref(false)
const savingStep3 = ref(false)
const savingRateLimit = ref(false)
const watermarkInputRef = ref<HTMLInputElement | null>(null)

// 速率限制配置
const rateLimit = ref<RateLimitConfig>({
  window_seconds: 300,
  max_attempts: 3,
  block_seconds: 900
})

// 配置数据
const config = reactive({
  // 页面配置
  subtitle: '',

  // 第一步
  system_prompt: '你是一个专业的菜品识别助手。请分析用户上传的菜品图片，返回详细的菜品信息。',
  user_template: `你是一个专业的菜品识别专家。请分析用户上传的菜品图片，返回详细的菜品信息。

我需要识别以下信息：
- 菜品名称（提供最可能的一个）
- 所属业态（中式餐饮、西餐或多国料理、日韩料理、烧烤、烤肉、无法判断选其一）
- 所属菜系（淮扬菜、粤菜、川菜等等可以根据实际情况，提供最可能的一个）
- 主要原材料（最多列出五种）
- 主要做法（越详细越好）
- 对此菜品的整体详细描述（越详细越好，最好从味道、口感、客群、意境等方面尽情发挥）
- 如果要拍摄好这道菜，摄影师的布光、相机参数建议（给出专业建议）

请严格以 JSON 格式返回，格式如下：
{
  "dish_name": "菜品名称",
  "business_type": "所属业态",
  "cuisine_type": "所属菜系",
  "main_ingredients": ["原料1", "原料2", ...],
  "cooking_method": "主要做法",
  "description": "整体详细描述",
  "photo_tips": "摄影建议"
}

【重要】在识别菜品之前，请先判断图片中是否包含多个独立的菜品：
- 如果图片中有且只有一个菜品 → 按照上面的 JSON 格式返回识别结果
- 如果图片中有多个菜品 → 返回：{"error": true, "code": "MULTIPLE_DISHES", "message": "检测到多个菜品，请上传单一菜品的图片"}
- 如果图片中没有菜品 → 返回：{"error": true, "code": "NON_DISH_IMAGE", "message": "未检测到菜品主体，请上传菜品图片"}
- 如果图片内容违规 → 返回：{"error": true, "code": "VIOLATION_IMAGE", "message": "图片内容违规，请更换图片后重试"}`,
  suffix: '',
  editable_fields: ['dish_name', 'business_type', 'cuisine_type'],
  visible_fields: ['dish_name', 'business_type', 'cuisine_type', 'main_ingredients', 'cooking_method', 'description', 'photo_tips'],
  coin_cost_preview: 0,

  // 第二步
  background_count_x: 10,
  select_count_max: 6,
  show_background_name: true,
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
    await updateConfig({
      subtitle: config.subtitle,
      system_prompt: config.system_prompt,
      user_template: config.user_template,
      suffix: config.suffix,
      editable_fields: config.editable_fields,
      visible_fields: config.visible_fields
    })
    ElMessage.success('配置已保存')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '保存失败')
  } finally {
    savingStep1.value = false
  }
}

async function saveStep2() {
  savingStep2.value = true
  try {
    await updateConfig({
      background_count_x: config.background_count_x,
      select_count_max: config.select_count_max,
      show_background_name: config.show_background_name,
      watermark_text: config.watermark_text,
      watermark_position: config.watermark_position,
      watermark_opacity: config.watermark_opacity
    })
    ElMessage.success('第二步配置已保存')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '保存失败')
  } finally {
    savingStep2.value = false
  }
}

async function saveStep3() {
  savingStep3.value = true
  try {
    await updateConfig({
      coin_cost_per_image: config.coin_cost_per_image,
      max_select_output: config.max_select_output,
      hd_enhance_coin: config.hd_enhance_coin
    })
    ElMessage.success('第三步配置已保存')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '保存失败')
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
  loadConfig()
  loadRateLimitConfig()
})

async function loadRateLimitConfig() {
  try {
    const data = await getRateLimitConfig()
    if (data) {
      rateLimit.value = data
    }
  } catch (error) {
    console.error('加载速率限制配置失败', error)
  }
}

async function saveRateLimit() {
  savingRateLimit.value = true
  try {
    await updateRateLimitConfig(rateLimit.value)
    ElMessage.success('速率限制配置已更新')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '配置更新失败')
  } finally {
    savingRateLimit.value = false
  }
}

async function loadConfig() {
  try {
    const data = await getConfig()
    // 填充配置数据
    config.subtitle = data.subtitle || ''
    config.system_prompt = data.system_prompt || config.system_prompt
    config.user_template = data.user_template || config.user_template
    config.suffix = data.suffix ?? ''
    config.editable_fields = data.editable_fields || config.editable_fields
    config.visible_fields = data.visible_fields || config.visible_fields
    config.background_count_x = data.background_count_x ?? 10
    config.select_count_max = data.select_count_max ?? 6
    config.show_background_name = data.show_background_name ?? true
    config.watermark_text = data.watermark_text || '预览水印'
    config.watermark_image = data.watermark_image || ''
    config.watermark_position = data.watermark_position || 'bottom-right'
    config.watermark_opacity = data.watermark_opacity ?? 50
    config.coin_cost_per_image = data.coin_cost_per_image ?? 5
    config.max_select_output = data.max_select_output ?? 3
    config.hd_enhance_coin = data.hd_enhance_coin ?? 5
  } catch (error) {
    console.error('加载配置失败', error)
  }
}
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
