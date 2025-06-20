/**
 * 音标提供者接口
 * 实现策略模式，支持多种音标API
 */

import { PhoneticResult } from '../types';

export interface IPhoneticProvider {
  /**
   * 提供者名称
   */
  readonly name: string;

  /**
   * 获取单词的音标信息
   * @param word 要查询的单词
   * @returns Promise<PhoneticResult> 音标查询结果
   */
  getPhonetic(word: string): Promise<PhoneticResult>;

  /**
   * 批量获取音标信息
   * @param words 要查询的单词数组
   * @returns Promise<PhoneticResult[]> 音标查询结果数组
   */
  getBatchPhonetics(words: string[]): Promise<PhoneticResult[]>;

  /**
   * 检查提供者是否可用
   * @returns Promise<boolean> 是否可用
   */
  isAvailable(): Promise<boolean>;

  /**
   * 获取提供者配置信息
   * @returns 提供者的配置信息
   */
  getConfig(): {
    endpoint?: string;
    rateLimitPerMinute?: number;
    supportsBatch?: boolean;
    supportsAudio?: boolean;
  };
}
