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
  } catch (error) {
    console.error(`Failed to get config ${groupKey}/${configKey}:`, error)
    return null
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
