import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getConfig } from '@/api/config'

export const useConfigStore = defineStore('config', () => {
  // 积分兑换比例（1元 = ? 积分）
  const coinExchangeRate = ref(10)

  // 批量充值优惠阈值
  const bulkDiscountThreshold = ref(100)

  // 批量充值优惠比例
  const bulkDiscountRate = ref(10)

  // 是否允许 VIP 充值
  const allowVipRecharge = ref(true)

  // 是否允许普通用户充值
  const allowUserRecharge = ref(true)

  // 是否已加载
  const loaded = ref(false)

  /**
   * 加载账务相关配置
   */
  async function loadBillingConfig() {
    try {
      const [rate, threshold, discountRate, vipRecharge, userRecharge] = await Promise.all([
        getConfig('system', 'coin_exchange_rate'),
        getConfig('system', 'bulk_discount_threshold'),
        getConfig('system', 'bulk_discount_rate'),
        getConfig('system', 'allow_vip_recharge'),
        getConfig('system', 'allow_user_recharge')
      ])

      if (rate) coinExchangeRate.value = parseFloat(rate)
      if (threshold) bulkDiscountThreshold.value = parseInt(threshold)
      if (discountRate) bulkDiscountRate.value = parseFloat(discountRate)
      if (vipRecharge !== null) allowVipRecharge.value = vipRecharge === 'true'
      if (userRecharge !== null) allowUserRecharge.value = userRecharge === 'true'

      loaded.value = true
    } catch (error) {
      console.error('加载账务配置失败:', error)
    }
  }

  /**
   * 计算充值获得的积分数量
   * @param amount 充值金额（人民币，元）
   */
  function calculateCoins(amount: number): number {
    // 基础积分 = 金额 * 兑换比例
    let coins = amount * coinExchangeRate.value

    // 批量优惠
    if (amount >= bulkDiscountThreshold.value) {
      const extraRate = bulkDiscountRate.value / 100
      coins = coins * (1 + extraRate)
    }

    return Math.floor(coins)
  }

  /**
   * 检查用户是否有充值权限
   * @param role 用户角色
   */
  function canRecharge(role: string): boolean {
    if (role === 'vip') return allowVipRecharge.value
    if (role === 'user') return allowUserRecharge.value
    return true // admin 和其他角色默认可充值
  }

  return {
    coinExchangeRate,
    bulkDiscountThreshold,
    bulkDiscountRate,
    allowVipRecharge,
    allowUserRecharge,
    loaded,
    loadBillingConfig,
    calculateCoins,
    canRecharge
  }
})
