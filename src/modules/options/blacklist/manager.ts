import glob from './glob';
import { BlacklistSettings } from './types';

// 默认设置
const DEFAULT_SETTINGS: BlacklistSettings = { patterns: [] };
const STORAGE_KEY = 'blacklist-settings';

export class BlacklistManager {
  async isBlacklisted(url: string): Promise<boolean> {
    const settings = await this.getSettings();

    if (settings.patterns.length === 0) {
      return false;
    }

    return settings.patterns.some((pattern) => glob.match(pattern, url));
  }

  async getPatterns(): Promise<string[]> {
    const settings = await this.getSettings();
    return settings.patterns;
  }

  async addPattern(pattern: string): Promise<void> {
    if (!pattern) return;

    const settings = await this.getSettings();
    if (!settings.patterns.includes(pattern)) {
      settings.patterns.push(pattern);
      await this.saveSettings(settings);
    }
  }

  async removePattern(pattern: string): Promise<void> {
    const settings = await this.getSettings();

    const index = settings.patterns.indexOf(pattern);
    if (index > -1) {
      settings.patterns.splice(index, 1);
      await this.saveSettings(settings);
    }
  }

  // 获取设置，确保返回有效的数据结构
  private async getSettings(): Promise<BlacklistSettings> {
    try {
      const result = await browser.storage.sync.get(STORAGE_KEY);
      if (result && result[STORAGE_KEY]) {
        const settings = JSON.parse(result[STORAGE_KEY]);
        return settings;
      }
      return DEFAULT_SETTINGS;
    } catch (_) {
      return DEFAULT_SETTINGS;
    }
  }

  // 保存设置，确保数据结构正确
  private async saveSettings(settings: BlacklistSettings): Promise<void> {
    try {
      // 先序列化
      const serializedSettings = JSON.stringify(settings);
      await browser.storage.sync.set({ [STORAGE_KEY]: serializedSettings });
    } catch (error) {
      console.error('保存黑名单设置失败:', error);
    }
  }
}
