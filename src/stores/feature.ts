import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFeatures, saveFeatures, defaultFeatures, type FeatureItem } from '@/api/config'

export const useFeatureStore = defineStore('feature', () => {
  const features = ref<FeatureItem[]>([...defaultFeatures])
  const isLoading = ref(false)
  const isSaving = ref(false)

  // 加载功能配置
  async function loadFeatures() {
    isLoading.value = true
    try {
      const data = await getFeatures()
      features.value = data
    } catch (error) {
      console.error('Failed to load features:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 保存功能配置
  async function saveFeatureConfig() {
    isSaving.value = true
    try {
      const success = await saveFeatures(features.value)
      if (!success) {
        throw new Error('保存失败')
      }
      return true
    } catch (error) {
      console.error('Failed to save features:', error)
      return false
    } finally {
      isSaving.value = false
    }
  }

  // 更新单个功能
  function updateFeature(id: string, updates: Partial<FeatureItem>) {
    const index = features.value.findIndex(f => f.id === id)
    if (index !== -1) {
      features.value[index] = { ...features.value[index], ...updates }
    }
  }

  // 删除功能
  function removeFeature(id: string) {
    const index = features.value.findIndex(f => f.id === id)
    if (index !== -1) {
      features.value.splice(index, 1)
      // 删除后重新排序，确保 order 是连续的 1, 2, 3...
      features.value.forEach((f, i) => {
        f.order = i + 1
      })
    }
  }

  // 添加功能
  function addFeature(feature: FeatureItem) {
    features.value.push(feature)
  }

  // 排序功能
  function reorderFeatures(newOrder: FeatureItem[]) {
    features.value = newOrder.map((f, index) => ({ ...f, order: index + 1 }))
  }

  // 获取可见功能列表（排除 hidden）
  function getVisibleFeatures() {
    return features.value
      .filter(f => f.status !== 'hidden')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  // 获取用户功能列表
  function getUserFeatures() {
    return getVisibleFeatures().filter(f => f.showInUserList)
  }

  // 获取专业组功能列表
  function getVipFeatures() {
    return getVisibleFeatures().filter(f => f.showInVipList)
  }

  return {
    features,
    isLoading,
    isSaving,
    loadFeatures,
    saveFeatureConfig,
    updateFeature,
    removeFeature,
    addFeature,
    reorderFeatures,
    getVisibleFeatures,
    getUserFeatures,
    getVipFeatures
  }
})
