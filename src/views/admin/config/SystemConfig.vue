<template>
  <div class="system-config">
    <div class="config-sections">
      <div class="config-card">
        <h2>充值权限</h2>
        <el-form label-width="160px">
          <el-form-item label="专业组充值">
            <el-switch v-model="config.allowVipRecharge" @change="handleRechargeChange('vip', $event)" />
            <span class="form-tip">允许专业组用户充值积分</span>
          </el-form-item>
          <el-form-item label="普通用户充值">
            <el-switch v-model="config.allowUserRecharge" @change="handleRechargeChange('user', $event)" />
            <span class="form-tip">允许普通用户充值积分</span>
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
            <li>账务参数（积分兑换比例、批量充值优惠）</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfig, saveConfig } from '@/api/config'

const config = ref({
  allowVipRecharge: true,
  allowUserRecharge: true
})

async function loadConfig() {
  try {
    const [allowVipRecharge, allowUserRecharge] = await Promise.all([
      getConfig('system', 'allow_vip_recharge'),
      getConfig('system', 'allow_user_recharge')
    ])

    if (allowVipRecharge !== null) {
      config.value.allowVipRecharge = allowVipRecharge === 'true'
    }
    if (allowUserRecharge !== null) {
      config.value.allowUserRecharge = allowUserRecharge === 'true'
    }
  } catch (error) {
    console.error('加载配置失败', error)
  }
}

async function handleRechargeChange(type: 'vip' | 'user', value: boolean) {
  try {
    const key = type === 'vip' ? 'allow_vip_recharge' : 'allow_user_recharge'
    await saveConfig('system', key, String(value))
    ElMessage.success('配置已更新')
  } catch (error) {
    ElMessage.error('配置更新失败')
    // 恢复原值
    await loadConfig()
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
