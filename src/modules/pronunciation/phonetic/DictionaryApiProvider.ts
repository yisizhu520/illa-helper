/**
 * Dictionary API 提供者实现
 * 调用 https://api.dictionaryapi.dev/api/v2/entries/en/ 获取音标信息
 */

import { IPhoneticProvider } from './IPhoneticProvider';
import {
  PhoneticResult,
  PhoneticInfo,
  PhoneticEntry,
  MeaningEntry,
  DefinitionEntry,
  CacheEntry,
} from '../types';
import { API_CONSTANTS } from '../config';

export class DictionaryApiProvider implements IPhoneticProvider {
  readonly name = 'dictionary-api';
  private readonly baseUrl = API_CONSTANTS.DICTIONARY_API_BASE_URL;
  private cache = new Map<string, CacheEntry<PhoneticInfo>>();
  private readonly cacheTTL = API_CONSTANTS.AI_TRANSLATION_CACHE_TTL;

  /**
   * 获取单词的音标信息
   */
  async getPhonetic(word: string): Promise<PhoneticResult> {
    try {
      // 数据验证
      if (!word || typeof word !== 'string') {
        return {
          success: false,
          error: '单词参数无效',
        };
      }

      const cleanWord = word.toLowerCase().trim();

      // 检查缓存
      const cached = this.getFromCache(cleanWord);
      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true,
        };
      }

      // 调用API
      const response = await fetch(
        `${this.baseUrl}${encodeURIComponent(cleanWord)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            Referer: location.href,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: `词库无该单词的音标`,
          };
        }
        throw new Error(
          `API请求失败: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const phoneticInfo = this.parseApiResponse(data, cleanWord);

      // 存入缓存
      this.setCache(cleanWord, phoneticInfo);

      return {
        success: true,
        data: phoneticInfo,
        cached: false,
      };
    } catch (error) {
      console.error('获取音标失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 批量获取音标信息
   */
  async getBatchPhonetics(words: string[]): Promise<PhoneticResult[]> {
    // Dictionary API 不支持批量请求，使用并发单个请求
    const promises = words.map((word) => this.getPhonetic(word));
    return Promise.all(promises);
  }

  /**
   * 检查提供者是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      const testResponse = await fetch(`${this.baseUrl}hello`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000), // 5秒超时
      });
      return testResponse.ok || testResponse.status === 404; // 404也表示API可用
    } catch {
      return false;
    }
  }

  /**
   * 获取提供者配置
   */
  getConfig() {
    return {
      endpoint: this.baseUrl,
      rateLimitPerMinute: 450, // Dictionary API 限制
      supportsBatch: false,
      supportsAudio: true,
    };
  }

  /**
   * 解析API响应数据
   */
  private parseApiResponse(data: any[], word: string): PhoneticInfo {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('API响应数据格式错误');
    }

    const entry = data[0]; // 取第一个条目
    const phonetics: PhoneticEntry[] = [];
    const meanings: MeaningEntry[] = [];

    // 解析音标
    if (entry.phonetics && Array.isArray(entry.phonetics)) {
      entry.phonetics.forEach((phonetic: any) => {
        if (phonetic.text || phonetic.audio) {
          phonetics.push({
            text: phonetic.text,
            audio: phonetic.audio,
            sourceUrl: phonetic.sourceUrl,
          });
        }
      });
    }

    // 解析词义
    if (entry.meanings && Array.isArray(entry.meanings)) {
      entry.meanings.forEach((meaning: any) => {
        if (meaning.partOfSpeech && meaning.definitions) {
          const definitions: DefinitionEntry[] = meaning.definitions.map(
            (def: any) => ({
              definition: def.definition || '',
              example: def.example,
              synonyms: def.synonyms,
            }),
          );

          meanings.push({
            partOfSpeech: meaning.partOfSpeech,
            definitions,
          });
        }
      });
    }

    return {
      word,
      phonetics,
      meanings,
    };
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(word: string): PhoneticInfo | null {
    const entry = this.cache.get(word);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data;
    }

    // 清理过期缓存
    if (entry) {
      this.cache.delete(word);
    }

    return null;
  }

  /**
   * 设置缓存
   */
  private setCache(word: string, data: PhoneticInfo): void {
    this.cache.set(word, {
      data,
      timestamp: Date.now(),
      ttl: this.cacheTTL,
    });

    // 限制缓存大小
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }
}
