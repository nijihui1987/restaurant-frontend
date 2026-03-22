import api from './request'

export interface ConfigItem {
  group_key: string
  config_key: string
  config_value: string
  description?: string
}

export interface AnnouncementConfig {
  content: string
  enabled: boolean
}

// 获取配置项
export async function getConfig(groupKey: string, configKey: string): Promise<string | null> {
  try {
    const res = await api.get<ConfigItem>(`/config/${groupKey}/${configKey}`)
    return res.data.config_value
  } catch (error: any) {
    // 404 表示配置不存在，不是错误，不需要打印
    if (error?.response?.status === 404) {
      return null
    }
    console.error(`Failed to get config ${groupKey}/${configKey}:`, error)
    return null
  }
}

// 保存配置项
export async function saveConfig(groupKey: string, configKey: string, value: string): Promise<boolean> {
  try {
    await api.put(`/config/${groupKey}/${configKey}`, {
      config_value: value
    })
    return true
  } catch (error) {
    console.error(`Failed to save config ${groupKey}/${configKey}:`, error)
    return false
  }
}

// 获取公告配置
export async function getAnnouncement(): Promise<AnnouncementConfig | null> {
  try {
    const value = await getConfig('system', 'announcement')
    if (!value) return null
    return JSON.parse(value) as AnnouncementConfig
  } catch (error) {
    console.error('Failed to get announcement:', error)
    return null
  }
}

// 保存公告配置
export async function saveAnnouncement(config: AnnouncementConfig): Promise<boolean> {
  return saveConfig('system', 'announcement', JSON.stringify(config))
}

// 获取教程内容
export async function getTutorial(): Promise<string | null> {
  return getConfig('system', 'tutorial')
}

// 保存教程内容
export async function saveTutorial(content: string): Promise<boolean> {
  return saveConfig('system', 'tutorial', content)
}

// 获取Logo配置
export async function getLogoConfig(): Promise<{ logo_url: string; logo_text: string } | null> {
  try {
    const value = await getConfig('system', 'logo')
    if (!value) return null
    return JSON.parse(value)
  } catch (error) {
    console.error('Failed to get logo config:', error)
    return null
  }
}

// 保存Logo配置
export async function saveLogoConfig(config: { logo_url: string; logo_text: string }): Promise<boolean> {
  return saveConfig('system', 'logo', JSON.stringify(config))
}

// 功能选项卡接口
export interface FeatureItem {
  id: string
  path: string
  title: string
  desc: string
  image: string
  status: 'enabled' | 'blocked' | 'hidden'
  order: number
  showInUserList: boolean  // 是否在用户功能列表显示
  showInVipList: boolean  // 是否在VIP功能列表显示
  blockedText?: string  // 遮挡时显示的文字
  actionText?: string  // 按钮文字，默认"进入"
  coinCost?: number  // 消耗积分数
}

// 默认功能列表
export const defaultFeatures: FeatureItem[] = [
  {
    id: 'masterpiece',
    path: '/masterpiece',
    title: '手机随拍成片',
    desc: 'AI 智能识别，菜品图秒变专业摄影作品',
    image: 'https://picsum.photos/seed/masterpiece/600/300',
    status: 'enabled',
    order: 1,
    showInUserList: true,
    showInVipList: true,
    blockedText: '即将上线',
    actionText: '进入'
  },
  {
    id: 'batch',
    path: '/batch',
    title: '批量套图成片',
    desc: '一次上传多张，批量处理成专业素材',
    image: 'https://picsum.photos/seed/batch/600/300',
    status: 'enabled',
    order: 2,
    showInUserList: true,
    showInVipList: true,
    blockedText: '即将上线',
    actionText: '进入'
  },
  {
    id: 'enhance',
    path: '/enhance',
    title: '智能高清优化',
    desc: 'AI 提升清晰度，还原图片细节',
    image: 'https://picsum.photos/seed/enhance/600/300',
    status: 'enabled',
    order: 3,
    showInUserList: true,
    showInVipList: true,
    blockedText: '即将上线',
    actionText: '进入'
  },
  {
    id: 'wechat',
    path: '/wechat',
    title: '微信营销出图',
    desc: '生成适合微信分享的高质量图片',
    image: 'https://picsum.photos/seed/wechat/600/300',
    status: 'enabled',
    order: 4,
    showInUserList: true,
    showInVipList: true,
    blockedText: '即将上线',
    actionText: '进入'
  },
  {
    id: 'dianping',
    path: '/dianping',
    title: '大众点评装修',
    desc: '为店铺生成专业的头图和菜单',
    image: 'https://picsum.photos/seed/dianping/600/300',
    status: 'enabled',
    order: 5,
    showInUserList: true,
    showInVipList: true,
    blockedText: '即将上线',
    actionText: '进入'
  },
  {
    id: 'douyin',
    path: '/douyin',
    title: '抖音门店装修',
    desc: '为抖音店铺生成吸睛视觉素材',
    image: 'https://picsum.photos/seed/douyin/600/300',
    status: 'enabled',
    order: 6,
    showInUserList: true,
    showInVipList: true,
    blockedText: '即将上线',
    actionText: '进入'
  },
  {
    id: 'menu',
    path: '/menu',
    title: '印刷菜单出图',
    desc: '生成适合印刷的高清菜单图片',
    image: 'https://picsum.photos/seed/menu/600/300',
    status: 'enabled',
    order: 7,
    showInUserList: true,
    showInVipList: true,
    blockedText: '即将上线'
  }
]

// 获取首页功能配置
export async function getFeatures(): Promise<FeatureItem[]> {
  try {
    const value = await getConfig('home', 'features')
    if (!value) return defaultFeatures
    const parsed = JSON.parse(value)
    const features = parsed.features || defaultFeatures
    // 确保按 order 字段排序
    return features.sort((a: FeatureItem, b: FeatureItem) => (a.order || 0) - (b.order || 0))
  } catch (error) {
    console.error('Failed to get features:', error)
    return defaultFeatures
  }
}

// 保存首页功能配置
export async function saveFeatures(features: FeatureItem[]): Promise<boolean> {
  return saveConfig('home', 'features', JSON.stringify({ features }))
}
