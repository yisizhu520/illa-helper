import { BlacklistSettings, DEFAULT_BLACKLIST_SETTINGS } from './types';

const STORAGE_KEY = 'illa-helper-blacklist-settings';

export class BlacklistStorage {
  async get(): Promise<BlacklistSettings> {
    try {
      const result = await browser.storage.sync.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        return result[STORAGE_KEY];
      }
      return DEFAULT_BLACKLIST_SETTINGS;
    } catch (error) {
      console.error('Failed to get blacklist settings:', error);
      return DEFAULT_BLACKLIST_SETTINGS;
    }
  }

  async set(settings: BlacklistSettings): Promise<void> {
    try {
      await browser.storage.sync.set({ [STORAGE_KEY]: settings });
    } catch (error) {
      console.error('Failed to set blacklist settings:', error);
    }
  }
}
