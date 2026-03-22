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

      <div class="config-card">
        <h2>账务参数</h2>
        <el-form label-width="160px">
          <el-form-item label="积分兑换比例">
            <el-input-number v-model="config.coinExchangeRate" :min="1" :max="100" :precision="1" />
            <span class="form-tip">1 元人民币 = ? 积分</span>
          </el-form-item>
          <el-form-item label="批量充值优惠">
            <el-input-number v-model="config.bulkDiscountThreshold" :min="0" :max="10000" />
            <span class="form-tip">满 ? 元享额外积分赠送</span>
          </el-form-item>
          <el-form-item label="优惠比例">
            <el-input-number v-model="config.bulkDiscountRate" :min="1" :max="50" :precision="1" />
            <span class="form-tip">每满 100 元额外赠送 ?% 积分</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="config-card">
        <h2>充值权限</h2>
        <el-form label-width="160px">
          <el-form-item label="专业组充值">
            <el-switch v-model="config.allowVipRecharge" />
            <span class="form-tip">允许专业组用户充值积分</span>
          </el-form-item>
          <el-form-item label="普通用户充值">
            <el-switch v-model="config.allowUserRecharge" />
            <span class="form-tip">允许普通用户充值积分</span>
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfig, saveConfig as saveConfigApi } from '@/api/config'

const config = ref({
  volcApiKey: '',
  dashscopeApiKey: '',
  minimaxApiKey: '',
  ossAccessKey: '',
  ossSecretKey: '',
  ossBucket: '',
  ossEndpoint: '',
  tokenExpireHours: 1,
  maxUploadSize: 20,
  coinExchangeRate: 10,
  bulkDiscountThreshold: 100,
  bulkDiscountRate: 10,
  allowVipRecharge: true,
  allowUserRecharge: true
})

const loading = ref(false)

async function loadConfig() {
  const keys = [
    'llm/volc_api_key',
    'llm/dashscope_api_key',
    'llm/minimax_api_key',
    'oss/access_key',
    'oss/secret_key',
    'oss/bucket',
    'oss/endpoint',
    'system/token_expire_hours',
    'system/max_upload_size',
    'system/coin_exchange_rate',
    'system/bulk_discount_threshold',
    'system/bulk_discount_rate',
    'system/allow_vip_recharge',
    'system/allow_user_recharge'
  ]

  const results = await Promise.all(keys.map(key => getConfig(key.split('/')[0], key.split('/')[1])))

  if (results[0]) config.value.volcApiKey = results[0]
  if (results[1]) config.value.dashscopeApiKey = results[1]
  if (results[2]) config.value.minimaxApiKey = results[2]
  if (results[3]) config.value.ossAccessKey = results[3]
  if (results[4]) config.value.ossSecretKey = results[4]
  if (results[5]) config.value.ossBucket = results[5]
  if (results[6]) config.value.ossEndpoint = results[6]
  if (results[7]) config.value.tokenExpireHours = parseInt(results[7]) || 1
  if (results[8]) config.value.maxUploadSize = parseInt(results[8]) || 20
  if (results[9]) config.value.coinExchangeRate = parseFloat(results[9]) || 10
  if (results[10]) config.value.bulkDiscountThreshold = parseInt(results[10]) || 100
  if (results[11]) config.value.bulkDiscountRate = parseFloat(results[11]) || 10
  if (results[12]) config.value.allowVipRecharge = results[12] === 'true'
  if (results[13]) config.value.allowUserRecharge = results[13] === 'true'
}

async function saveConfig() {
  loading.value = true
  try {
    const configs = [
      { key: 'llm/volc_api_key', value: config.value.volcApiKey },
      { key: 'llm/dashscope_api_key', value: config.value.dashscopeApiKey },
      { key: 'llm/minimax_api_key', value: config.value.minimaxApiKey },
      { key: 'oss/access_key', value: config.value.ossAccessKey },
      { key: 'oss/secret_key', value: config.value.ossSecretKey },
      { key: 'oss/bucket', value: config.value.ossBucket },
      { key: 'oss/endpoint', value: config.value.ossEndpoint },
      { key: 'system/token_expire_hours', value: String(config.value.tokenExpireHours) },
      { key: 'system/max_upload_size', value: String(config.value.maxUploadSize) },
      { key: 'system/coin_exchange_rate', value: String(config.value.coinExchangeRate) },
      { key: 'system/bulk_discount_threshold', value: String(config.value.bulkDiscountThreshold) },
      { key: 'system/bulk_discount_rate', value: String(config.value.bulkDiscountRate) },
      { key: 'system/allow_vip_recharge', value: String(config.value.allowVipRecharge) },
      { key: 'system/allow_user_recharge', value: String(config.value.allowUserRecharge) }
    ]

    await Promise.all(configs.map(c => {
      const [group, key] = c.key.split('/')
      return saveConfigApi(group, key, c.value)
    }))

    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('配置保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadConfig()
})
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
