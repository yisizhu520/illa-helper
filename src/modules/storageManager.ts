/**
 * 存储管理模块
 * 负责管理用户配置的存储
 */

import { UserSettings, DEFAULT_SETTINGS, ApiConfig, TranslationDirection, TriggerMode, TranslationStyle, UserLevel } from './types';

// 存储管理器
export class StorageManager {
  /**
   * 获取用户设置
   * @returns 用户设置
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      const result = await browser.storage.sync.get(Object.keys(DEFAULT_SETTINGS));

      // 处理旧版本的 apiKey 设置
      let apiConfig = result.apiConfig || { ...DEFAULT_SETTINGS.apiConfig };
      if (result.apiKey) {
        apiConfig.apiKey = result.apiKey;
      }

      return { ...DEFAULT_SETTINGS, ...result, apiConfig };
    } catch (error) {
      console.error('获取用户设置失败:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * 保存用户设置
   * @param settings 要保存的部分用户设置
   */
  async saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      await browser.storage.sync.set(settings);
    } catch (error) {
      console.error('保存用户设置失败:', error);
    }
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<void> {
    try {
      await browser.storage.sync.clear();
      await browser.storage.local.clear();
    } catch (error) {
      console.error('清除所有数据失败:', error);
    }
  }
} 