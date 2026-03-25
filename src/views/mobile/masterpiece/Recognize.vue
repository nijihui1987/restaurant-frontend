<template>
  <div class="masterpiece-recognize">
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <el-icon :size="24"><ArrowLeft /></el-icon>
      </button>
      <h1>确认菜品信息</h1>
    </header>

    <main class="recognize-content">
      <div class="image-section">
        <img :src="imageUrl" alt="菜品图" class="dish-image" />
      </div>

      <div class="info-section">
        <div class="section-header">
          <h2>AI 识别结果</h2>
          <p class="section-hint">请确认以下信息是否准确</p>
        </div>

        <div class="info-form">
          <div class="form-item">
            <label>菜品名称</label>
            <el-input
              v-model="formData.dishName"
              placeholder="如：红烧肉"
              size="large"
            />
          </div>
          <div class="form-item">
            <label>菜品种类</label>
            <el-input
              v-model="formData.dishType"
              placeholder="如：热菜、凉菜"
              size="large"
            />
          </div>
          <div class="form-item">
            <label>口味描述</label>
            <el-input
              v-model="formData.taste"
              placeholder="如：咸甜、鲜香"
              size="large"
            />
          </div>
          <div class="form-item">
            <label>主要食材</label>
            <el-input
              v-model="formData.ingredients"
              placeholder="如：猪肉、冰糖"
              size="large"
            />
          </div>
          <div class="form-item">
            <label>烹饪方式</label>
            <el-input
              v-model="formData.cookingMethod"
              placeholder="如：红烧、炖煮"
              size="large"
            />
          </div>
        </div>

        <div class="action-section">
          <el-button size="large" @click="goBack" class="cancel-btn">
            上一步
          </el-button>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="submitForm"
            class="submit-btn"
          >
            继续备餐
          </el-button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { understandImage } from '@/api/vision'

const router = useRouter()
const route = useRoute()

const imageUrl = ref(route.query.imageUrl as string || '')

const formData = reactive({
  dishName: '',
  dishType: '',
  taste: '',
  ingredients: '',
  cookingMethod: ''
})

const submitting = ref(false)
const recognizing = ref(false)

onMounted(async () => {
  if (!imageUrl.value) {
    ElMessage.error('图片信息缺失')
    router.back()
    return
  }

  recognizing.value = true
  try {
    const res = await understandImage({
      image_url: imageUrl.value,
      question: '请识别这张菜品图，返回JSON格式：{"dishName":"菜品名称","dishType":"菜品种类如热菜凉菜","taste":"口味描述","ingredients":"主要食材用逗号分隔","cookingMethod":"烹饪方式"}。只返回JSON，不要其他文字。'
    })

    try {
      const jsonMatch = res.answer.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        formData.dishName = parsed.dishName || ''
        formData.dishType = parsed.dishType || ''
        formData.taste = parsed.taste || ''
        formData.ingredients = parsed.ingredients || ''
        formData.cookingMethod = parsed.cookingMethod || ''
      }
    } catch {
      formData.dishName = res.answer
    }
  } catch (error) {
    ElMessage.error('AI 识别失败，请手动填写')
  } finally {
    recognizing.value = false
  }
})

function goBack() {
  router.back()
}

async function submitForm() {
  if (!formData.dishName.trim()) {
    ElMessage.warning('请输入菜品名称')
    return
  }

  submitting.value = true
  try {
    ElMessage.success('提交成功，进入备菜队列')
    router.push('/masterpiece/queue')
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.masterpiece-recognize {
  min-height: 100vh;
  background: var(--bg-page);
}

.page-header {
  background: var(--bg-surface);
  padding: var(--space-lg) var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 var(--bg-hover);
}

.back-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-header h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.recognize-content {
  padding: var(--space-xl);
  max-width: 480px;
  margin: 0 auto;
}

.image-section {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  text-align: center;
}

.dish-image {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.info-section {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl) var(--space-xl);
}

.section-header {
  margin-bottom: var(--space-xl);
}

.section-header h2 {
  margin: 0 0 var(--space-xs);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-hint {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-item label {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-regular);
}

.form-item :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px var(--border-light);
  transition: box-shadow 0.2s ease;
}

.form-item :deep(.el-input__wrapper:hover),
.form-item :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-text-primary);
}

.form-item :deep(.el-input__inner) {
  font-size: var(--font-size-md);
}

.action-section {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-2xl);
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 48px;
  font-size: var(--font-size-md);
  font-weight: 500;
  border-radius: 24px;
}

.cancel-btn {
  background: var(--bg-page);
  border-color: var(--border-light);
  color: var(--color-text-regular);
}

.cancel-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
}

.submit-btn {
  background: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

.submit-btn:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
</style>
