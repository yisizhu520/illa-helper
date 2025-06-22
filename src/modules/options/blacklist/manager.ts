import { BlacklistStorage } from './storage';
import glob from './glob';

export class BlacklistManager {
  private storage: BlacklistStorage;

  constructor() {
    this.storage = new BlacklistStorage();
  }

  async isBlacklisted(url: string): Promise<boolean> {
    const settings = await this.storage.get();
    if (!settings.patterns || settings.patterns.length === 0) {
      return false;
    }

    return settings.patterns.some((pattern) => glob.match(pattern, url));
  }

  async getPatterns(): Promise<string[]> {
    const settings = await this.storage.get();
    return settings.patterns;
  }

  async addPattern(pattern: string): Promise<void> {
    const settings = await this.storage.get();
    if (pattern && !settings.patterns.includes(pattern)) {
      settings.patterns.push(pattern);
      await this.storage.set(settings);
    }
  }

  async removePattern(pattern: string): Promise<void> {
    const settings = await this.storage.get();
    const index = settings.patterns.indexOf(pattern);
    if (index > -1) {
      settings.patterns.splice(index, 1);
      await this.storage.set(settings);
    }
  }
}
