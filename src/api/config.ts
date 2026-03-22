import api, { publicApi } from './request'

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

// 获取配置项（公开接口，不需要认证）
async function getConfigPublic(groupKey: string, configKey: string): Promise<string | null> {
  try {
    const res = await publicApi.get<ConfigItem>(`/config/${groupKey}/${configKey}`)
    return res.data.config_value
  } catch (error) {
    console.error(`Failed to get config ${groupKey}/${configKey}:`, error)
    return null
  }
}

// 获取配置项（需要认证）
export async function getConfig(groupKey: string, configKey: string): Promise<string | null> {
  try {
    const res = await api.get<ConfigItem>(`/config/${groupKey}/${configKey}`)
    return res.data.config_value
  } catch (error) {
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

// 获取公告配置（公开接口）
export async function getAnnouncement(): Promise<AnnouncementConfig | null> {
  try {
    const value = await getConfigPublic('system', 'announcement')
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

// 获取教程内容（公开接口）
export async function getTutorial(): Promise<string | null> {
  return getConfigPublic('system', 'tutorial')
}

// 保存教程内容
export async function saveTutorial(content: string): Promise<boolean> {
  return saveConfig('system', 'tutorial', content)
}

// 获取Logo配置（公开接口）
export async function getLogoConfig(): Promise<{ logo_url: string; logo_text: string } | null> {
  try {
    const value = await getConfigPublic('system', 'logo')
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
