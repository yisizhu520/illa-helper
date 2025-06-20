/**
 * 音标提供者工厂
 * 使用工厂模式创建不同的音标提供者实例
 */

import { IPhoneticProvider } from '../interfaces/IPhoneticProvider';
import { DictionaryApiProvider } from './DictionaryApiProvider';

export class PhoneticProviderFactory {
  private static instances = new Map<string, IPhoneticProvider>();

  /**
   * 创建音标提供者实例
   * @param providerName 提供者名称
   * @returns IPhoneticProvider 提供者实例
   */
  static createProvider(providerName: string): IPhoneticProvider {
    // 检查是否已存在实例（单例模式）
    if (this.instances.has(providerName)) {
      return this.instances.get(providerName)!;
    }

    let provider: IPhoneticProvider;

    switch (providerName.toLowerCase()) {
      case 'dictionary-api':
        provider = new DictionaryApiProvider();
        break;

      // 可以在这里添加更多提供者
      // case 'other-api':
      //   provider = new OtherApiProvider();
      //   break;

      default:
        throw new Error(`未知的音标提供者: ${providerName}`);
    }

    // 缓存实例
    this.instances.set(providerName, provider);
    return provider;
  }

  /**
   * 获取所有支持的提供者名称
   * @returns string[] 提供者名称数组
   */
  static getSupportedProviders(): string[] {
    return ['dictionary-api'];
  }

  /**
   * 检查提供者是否支持
   * @param providerName 提供者名称
   * @returns boolean 是否支持
   */
  static isProviderSupported(providerName: string): boolean {
    return this.getSupportedProviders().includes(providerName.toLowerCase());
  }

  /**
   * 获取默认提供者
   * @returns IPhoneticProvider 默认提供者实例
   */
  static getDefaultProvider(): IPhoneticProvider {
    return this.createProvider('dictionary-api');
  }

  /**
   * 清除所有缓存的提供者实例
   */
  static clearInstances(): void {
    this.instances.clear();
  }

  /**
   * 获取提供者实例（如果存在）
   * @param providerName 提供者名称
   * @returns IPhoneticProvider | undefined 提供者实例或undefined
   */
  static getInstance(providerName: string): IPhoneticProvider | undefined {
    return this.instances.get(providerName);
  }
}
