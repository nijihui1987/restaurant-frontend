<template>
  <div class="system-config">
    <div class="config-sections">
      <!-- Logo 配置 -->
      <div class="config-card">
        <h2>Logo 设置</h2>
        <el-form label-width="140px">
          <el-form-item label="PC 端 Logo">
            <el-input
              v-model="logoConfig.pc_logo"
              placeholder="输入 PC 端 logo 图片 URL"
              @blur="handleLogoSave"
            >
              <template #append>
                <el-button @click="triggerLogoUpload('pc')">上传</el-button>
              </template>
            </el-input>
            <div class="logo-preview" v-if="logoConfig.pc_logo">
              <img :src="logoConfig.pc_logo" alt="PC Logo" />
            </div>
          </el-form-item>

          <el-form-item label="移动端 Logo">
            <el-input
              v-model="logoConfig.mobile_logo"
              placeholder="输入移动端 logo 图片 URL"
              @blur="handleLogoSave"
            >
              <template #append>
                <el-button @click="triggerLogoUpload('mobile')">上传</el-button>
              </template>
            </el-input>
            <div class="logo-preview" v-if="logoConfig.mobile_logo">
              <img :src="logoConfig.mobile_logo" alt="Mobile Logo" />
            </div>
          </el-form-item>

          <el-form-item label="登录页 Logo">
            <el-input
              v-model="logoConfig.login_logo"
              placeholder="输入登录页 logo 图片 URL"
              @blur="handleLogoSave"
            >
              <template #append>
                <el-button @click="triggerLogoUpload('login')">上传</el-button>
              </template>
            </el-input>
            <div class="logo-preview" v-if="logoConfig.login_logo">
              <img :src="logoConfig.login_logo" alt="Login Logo" />
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card">
        <h2>账务参数</h2>
        <el-form label-width="160px">
          <el-form-item label="积分兑换比例">
            <el-input-number v-model="config.coinExchangeRate" :min="1" :max="100" :precision="1" @change="handleChange('coin_exchange_rate', $event)" />
            <span class="form-tip">1 元人民币 = ? 积分</span>
          </el-form-item>
          <el-form-item label="批量充值优惠">
            <el-input-number v-model="config.bulkDiscountThreshold" :min="0" :max="10000" @change="handleChange('bulk_discount_threshold', $event)" />
            <span class="form-tip">满 ? 元享额外积分赠送</span>
          </el-form-item>
          <el-form-item label="优惠比例">
            <el-input-number v-model="config.bulkDiscountRate" :min="1" :max="50" :precision="1" @change="handleChange('bulk_discount_rate', $event)" />
            <span class="form-tip">每满 100 元额外赠送 ?% 积分</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card">
        <h2>充值权限</h2>
        <el-form label-width="160px">
          <el-form-item label="专业组充值">
            <el-switch v-model="config.allowVipRecharge" @change="handleChange('allow_vip_recharge', $event)" />
            <span class="form-tip">允许专业组用户充值积分</span>
          </el-form-item>
          <el-form-item label="普通用户充值">
            <el-switch v-model="config.allowUserRecharge" @change="handleChange('allow_user_recharge', $event)" />
            <span class="form-tip">允许普通用户充值积分</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card">
        <h2>防恶意提交（速率限制）</h2>
        <el-form label-width="160px">
          <el-form-item label="时间窗口">
            <el-input-number v-model="rateLimit.window_seconds" :min="60" :max="3600" :step="60" controls-position="right" />
            <span class="form-tip">单位：秒，范围 60-3600</span>
          </el-form-item>
          <el-form-item label="最大尝试次数">
            <el-input-number v-model="rateLimit.max_attempts" :min="1" :max="10" controls-position="right" />
            <span class="form-tip">范围 1-10</span>
          </el-form-item>
          <el-form-item label="阻止时间">
            <el-input-number v-model="rateLimit.block_seconds" :min="60" :max="7200" :step="60" controls-position="right" />
            <span class="form-tip">单位：秒，范围 60-7200</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" :loading="savingRateLimit" @click="saveRateLimitConfig">
              保存配置
            </el-button>
          </el-form-item>
          <el-form-item>
            <span class="form-tip">规则：在时间窗口内失败达到最大尝试次数后，将被阻止指定时间</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card info-card">
        <h2>配置说明</h2>
        <div class="info-content">
          <p>以下配置项由后端环境变量管理，无法通过前端修改：</p>
          <ul>
            <li>LLM API 配置（火山引擎、Dashscope、MiniMax）</li>
            <li>OSS 存储配置（AccessKey、SecretKey、Bucket、Endpoint）</li>
            <li>系统参数（Token 有效期、最大上传大小）</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfig, saveConfig, getLogoConfig, saveLogoConfig, type LogoConfig, getRateLimitConfig, updateRateLimitConfig, type RateLimitConfig } from '@/api/config'
import { uploadFile } from '@/api/oss'

const config = ref({
  coinExchangeRate: 10,
  bulkDiscountThreshold: 100,
  bulkDiscountRate: 10,
  allowVipRecharge: true,
  allowUserRecharge: true
})

async function loadConfig() {
  try {
    const [
      coinExchangeRate,
      bulkDiscountThreshold,
      bulkDiscountRate,
      allowVipRecharge,
      allowUserRecharge
    ] = await Promise.all([
      getConfig('system', 'coin_exchange_rate'),
      getConfig('system', 'bulk_discount_threshold'),
      getConfig('system', 'bulk_discount_rate'),
      getConfig('system', 'allow_vip_recharge'),
      getConfig('system', 'allow_user_recharge')
    ])

    if (coinExchangeRate !== null) config.value.coinExchangeRate = parseFloat(coinExchangeRate) || 10
    if (bulkDiscountThreshold !== null) config.value.bulkDiscountThreshold = parseInt(bulkDiscountThreshold) || 100
    if (bulkDiscountRate !== null) config.value.bulkDiscountRate = parseFloat(bulkDiscountRate) || 10
    if (allowVipRecharge !== null) config.value.allowVipRecharge = allowVipRecharge === 'true'
    if (allowUserRecharge !== null) config.value.allowUserRecharge = allowUserRecharge === 'true'
  } catch (error) {
    console.error('加载配置失败', error)
  }
}

async function handleChange(key: string, value: number | boolean) {
  try {
    await saveConfig('system', key, String(value))
    ElMessage.success('配置已更新')
  } catch (error) {
    ElMessage.error('配置更新失败')
    await loadConfig()
  }
}

// Logo 配置
const logoConfig = reactive<LogoConfig>({
  pc_logo: '',
  mobile_logo: '',
  login_logo: '',
  logo_text: ''
})

let logoUploadTarget: 'pc' | 'mobile' | 'login' = 'pc'

async function loadLogoConfig() {
  try {
    const data = await getLogoConfig()
    if (data) {
      logoConfig.pc_logo = data.pc_logo || ''
      logoConfig.mobile_logo = data.mobile_logo || ''
      logoConfig.login_logo = data.login_logo || ''
      logoConfig.logo_text = data.logo_text || ''
    }
  } catch (error) {
    console.error('加载 Logo 配置失败', error)
  }
}

async function handleLogoSave() {
  try {
    await saveLogoConfig({
      pc_logo: logoConfig.pc_logo,
      mobile_logo: logoConfig.mobile_logo,
      login_logo: logoConfig.login_logo,
      logo_text: logoConfig.logo_text
    })
    ElMessage.success('Logo 配置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

function triggerLogoUpload(target: 'pc' | 'mobile' | 'login') {
  logoUploadTarget = target
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const res = await uploadFile(file, 'logos')
        if (logoUploadTarget === 'pc') {
          logoConfig.pc_logo = res.url
        } else if (logoUploadTarget === 'mobile') {
          logoConfig.mobile_logo = res.url
        } else {
          logoConfig.login_logo = res.url
        }
        await handleLogoSave()
        ElMessage.success('Logo 上传成功')
      } catch (error) {
        ElMessage.error('上传失败')
      }
    }
  }
  input.click()
}

onMounted(() => {
  loadConfig()
  loadLogoConfig()
  loadRateLimitConfig()
})

// 速率限制配置
const rateLimit = ref<RateLimitConfig>({
  window_seconds: 300,
  max_attempts: 3,
  block_seconds: 900
})
const savingRateLimit = ref(false)

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

async function saveRateLimitConfig() {
  try {
    savingRateLimit.value = true
    await updateRateLimitConfig(rateLimit.value)
    ElMessage.success('速率限制配置已更新')
  } catch (error) {
    ElMessage.error('配置更新失败')
    await loadRateLimitConfig()
  } finally {
    savingRateLimit.value = false
  }
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

.logo-preview {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  display: inline-block;
}

.logo-preview img {
  max-height: 60px;
  max-width: 200px;
  object-fit: contain;
}

.form-tip {
  margin-left: 8px;
  color: #8c8c8c;
  font-size: 13px;
}

.info-card {
  background: #fafbfc;
}

.info-content {
  color: #595959;
  font-size: 13px;
  line-height: 1.8;
}

.info-content p {
  margin: 0 0 12px;
}

.info-content ul {
  margin: 0;
  padding-left: 20px;
}

.info-content li {
  margin-bottom: 6px;
}
</style>
