/**
 * 存储管理模块
 * 负责管理用户配置的存储，支持多语言智能翻译配置
 */

import {
  UserSettings,
  DEFAULT_SETTINGS,
  DEFAULT_MULTILINGUAL_CONFIG,
  DEFAULT_TOOLTIP_HOTKEY,
  DEFAULT_FLOATING_BALL_CONFIG,
} from './types';

// 存储管理器
export class StorageManager {
  /**
   * 配置版本号，用于数据迁移
   */
  private static readonly CURRENT_VERSION = '2.0.0';
  private static readonly VERSION_KEY = 'configVersion';

  /**
   * 获取用户设置
   * 包含自动数据迁移逻辑
   * @returns 用户设置
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      // 获取所有存储的数据
      const result = await browser.storage.sync.get(null);

      // 检查配置版本并执行迁移
      const migratedResult = await this.migrateConfigIfNeeded(result);

      // 处理旧版本的 apiKey 设置（保持向后兼容）
      const apiConfig = migratedResult.apiConfig || {
        ...DEFAULT_SETTINGS.apiConfig,
      };
      if (migratedResult.apiKey) {
        apiConfig.apiKey = migratedResult.apiKey;
        // 清理旧的 apiKey 字段
        delete migratedResult.apiKey;
      }

      // 确保多语言配置存在
      const multilingualConfig =
        migratedResult.multilingualConfig || DEFAULT_MULTILINGUAL_CONFIG;

      // 构建完整的用户设置
      const userSettings: UserSettings = {
        ...DEFAULT_SETTINGS,
        ...migratedResult,
        apiConfig,
        multilingualConfig,
      };

      // 验证和修复配置
      const validatedSettings = this.validateAndFixSettings(userSettings);

      // 如果配置被修复，保存更新后的设置
      if (this.hasConfigurationChanged(userSettings, validatedSettings)) {
        await this.saveUserSettings(validatedSettings);
      }

      return validatedSettings;
    } catch (error) {
      console.error('获取用户设置失败:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * 保存用户设置
   * @param settings 要保存的部分用户设置
   */
  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      const settingsWithVersion = {
        ...settings,
        [StorageManager.VERSION_KEY]: StorageManager.CURRENT_VERSION,
      };

      await browser.storage.sync.set(settingsWithVersion);
    } catch (error) {
      console.error('保存用户设置失败:', error);
      throw error;
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

  /**
   * 新增：数据迁移逻辑
   * 处理从旧版本到新版本的配置迁移
   * @param rawData 原始存储数据
   * @returns 迁移后的数据
   */
  private async migrateConfigIfNeeded(rawData: any): Promise<any> {
    const currentVersion = rawData[StorageManager.VERSION_KEY];

    // 如果没有版本号，说明是旧版本数据
    if (!currentVersion) {
      console.log('检测到旧版本配置，开始数据迁移...');
      return this.migrateFromLegacyVersion(rawData);
    }

    // 如果版本号不匹配，执行相应的迁移
    if (currentVersion !== StorageManager.CURRENT_VERSION) {
      console.log(
        `配置版本从 ${currentVersion} 迁移到 ${StorageManager.CURRENT_VERSION}`,
      );
      return this.migrateFromVersion(rawData, currentVersion);
    }

    return rawData;
  }

  /**
   * 新增：从旧版本（无版本号）迁移配置
   * @param legacyData 旧版本数据
   * @returns 迁移后的数据
   */
  private migrateFromLegacyVersion(legacyData: any): any {
    const migratedData = { ...legacyData };

    // 添加多语言配置
    if (!migratedData.multilingualConfig) {
      migratedData.multilingualConfig = {
        ...DEFAULT_MULTILINGUAL_CONFIG,
        // 根据旧的翻译方向设置智能模式状态
        intelligentMode:
          migratedData.translationDirection === 'intelligent' || false,
        // 不设置默认目标语言，强制用户选择
        targetLanguage: '',
      };
    }

    // 如果翻译方向是智能模式，确保设置正确
    if (migratedData.translationDirection === 'intelligent') {
      migratedData.multilingualConfig.intelligentMode = true;
    }

    console.log('旧版本配置迁移完成');
    return migratedData;
  }

  /**
   * 新增：从指定版本迁移配置
   * @param data 当前数据
   * @param fromVersion 源版本
   * @returns 迁移后的数据
   */
  private migrateFromVersion(data: any, fromVersion: string): any {
    let migratedData = { ...data };

    // 根据版本号执行不同的迁移策略
    switch (fromVersion) {
      case '1.0.0':
        migratedData = this.migrateFrom1_0_0(migratedData);
        break;
      // 未来可以添加更多版本的迁移逻辑
      default:
        console.warn(`未知的配置版本: ${fromVersion}，使用默认迁移策略`);
        migratedData = this.migrateFromLegacyVersion(migratedData);
    }

    return migratedData;
  }

  /**
   * 新增：从1.0.0版本迁移
   * @param data 1.0.0版本数据
   * @returns 迁移后的数据
   */
  private migrateFrom1_0_0(data: any): any {
    // 实现具体的1.0.0到2.0.0的迁移逻辑
    return this.migrateFromLegacyVersion(data);
  }

  /**
   * 新增：验证和修复用户设置
   * @param settings 用户设置
   * @returns 验证并修复后的设置
   */
  private validateAndFixSettings(settings: UserSettings): UserSettings {
    const fixedSettings = { ...settings };

    // 验证多语言配置
    if (!fixedSettings.multilingualConfig) {
      fixedSettings.multilingualConfig = DEFAULT_MULTILINGUAL_CONFIG;
    } else {
      // 确保必要字段存在
      if (
        typeof fixedSettings.multilingualConfig.intelligentMode !== 'boolean'
      ) {
        fixedSettings.multilingualConfig.intelligentMode =
          DEFAULT_MULTILINGUAL_CONFIG.intelligentMode;
      }
      if (!fixedSettings.multilingualConfig.targetLanguage) {
        fixedSettings.multilingualConfig.targetLanguage =
          DEFAULT_MULTILINGUAL_CONFIG.targetLanguage;
      }
      // fallbackToEnglish已移除，不再需要验证
    }

    // 验证翻译方向与智能模式的一致性
    if (
      fixedSettings.multilingualConfig.intelligentMode &&
      fixedSettings.translationDirection !== 'intelligent'
    ) {
      fixedSettings.translationDirection = 'intelligent';
    }

    // 验证目标语言代码格式
    if (fixedSettings.multilingualConfig.targetLanguage) {
      const targetLang =
        fixedSettings.multilingualConfig.targetLanguage.toLowerCase();
      if (targetLang.length < 2 || targetLang.length > 3) {
        fixedSettings.multilingualConfig.targetLanguage = ''; // 无效时清空，不设置默认值
      }
    }

    // 验证API配置
    if (!fixedSettings.apiConfig) {
      fixedSettings.apiConfig = DEFAULT_SETTINGS.apiConfig;
    }

    // 验证发音快捷键配置
    if (!fixedSettings.pronunciationHotkey) {
      fixedSettings.pronunciationHotkey = { ...DEFAULT_TOOLTIP_HOTKEY };
    } else {
      // 验证必要字段
      if (typeof fixedSettings.pronunciationHotkey.enabled !== 'boolean') {
        fixedSettings.pronunciationHotkey.enabled = true;
      }
    }

    // 验证悬浮球配置
    if (!fixedSettings.floatingBall) {
      fixedSettings.floatingBall = { ...DEFAULT_FLOATING_BALL_CONFIG };
    } else {
      // 验证必要字段
      if (typeof fixedSettings.floatingBall.enabled !== 'boolean') {
        fixedSettings.floatingBall.enabled = false;
      }
      if (
        typeof fixedSettings.floatingBall.position !== 'number' ||
        fixedSettings.floatingBall.position < 0 ||
        fixedSettings.floatingBall.position > 100
      ) {
        fixedSettings.floatingBall.position = 50;
      }
      if (
        typeof fixedSettings.floatingBall.opacity !== 'number' ||
        fixedSettings.floatingBall.opacity < 0.1 ||
        fixedSettings.floatingBall.opacity > 1
      ) {
        fixedSettings.floatingBall.opacity = 0.8;
      }
    }

    return fixedSettings;
  }

  /**
   * 新增：检查配置是否发生变化
   * @param original 原始配置
   * @param fixed 修复后的配置
   * @returns 是否发生变化
   */
  private hasConfigurationChanged(
    original: UserSettings,
    fixed: UserSettings,
  ): boolean {
    return JSON.stringify(original) !== JSON.stringify(fixed);
  }

  /**
   * 新增：获取配置统计信息
   * 用于调试和监控
   * @returns 配置统计信息
   */
  async getConfigStats(): Promise<{
    version: string;
    intelligentModeEnabled: boolean;
    targetLanguage: string;
    totalKeys: number;
  }> {
    try {
      const settings = await this.getUserSettings();
      const allData = await browser.storage.sync.get(null);

      return {
        version: allData[StorageManager.VERSION_KEY] || 'legacy',
        intelligentModeEnabled:
          settings.multilingualConfig?.intelligentMode || false,
        targetLanguage: settings.multilingualConfig?.targetLanguage || 'none',
        totalKeys: Object.keys(allData).length,
      };
    } catch (error) {
      console.error('获取配置统计信息失败:', error);
      return {
        version: 'unknown',
        intelligentModeEnabled: false,
        targetLanguage: 'none',
        totalKeys: 0,
      };
    }
  }
}
