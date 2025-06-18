/**
 * 文本替换模块
 * 负责将中文文本中的部分词汇替换为英文
 */

import { ApiService } from './apiService';
import {
  UserSettings,
  FullTextAnalysisResponse,
  ReplacementConfig,
  TranslationStyle,
  DEFAULT_SETTINGS,
} from './types';
import { StyleManager } from './styleManager';

// 替换结果接口
export interface ReplacementResult {
  original: string; // 原始文本
  replaced: string; // 替换后的文本
  replacedWords: Array<{
    // 替换的词汇信息
    chinese: string;
    english: string;
    position: {
      start: number;
      end: number;
    };
    isNew: boolean; // 是否是生词
  }>;
}

// 文本替换器
export class TextReplacer {
  private apiService: ApiService;
  private styleManager: StyleManager;
  private config: ReplacementConfig;
  private cache: Map<string, FullTextAnalysisResponse>;

  constructor(config: ReplacementConfig) {
    this.config = config;
    this.apiService = new ApiService();
    this.styleManager = new StyleManager();
    this.cache = new Map<string, FullTextAnalysisResponse>();
    this.styleManager.setTranslationStyle(
      this.config.translationStyle || TranslationStyle.DEFAULT,
    );
  }

  /**
   * 设置配置
   * @param config 替换配置
   */
  setConfig(config: Partial<ReplacementConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.config.translationStyle) {
      this.styleManager.setTranslationStyle(this.config.translationStyle);
    }
  }

  /**
   * 替换文本
   * @param text 原始文本
   * @returns 替换结果
   */
  async replaceText(text: string): Promise<FullTextAnalysisResponse> {
    // 检查缓存
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    // 如果不使用API，直接返回原文
    if (!this.config.useGptApi) {
      return {
        original: text,
        processed: text,
        replacements: [],
      };
    }

    try {
      // 从 this.config 构建一个完整的、类型安全的 UserSettings 对象以传递给 API
      const settingsForApi: UserSettings = {
        ...DEFAULT_SETTINGS, // 使用 types.ts 中的默认设置作为基础
        userLevel: this.config.userLevel,
        replacementRate: this.config.replacementRate,
        useGptApi: this.config.useGptApi,
        translationStyle: this.config.translationStyle,
        translationDirection: this.config.translationDirection,
        apiConfig: {
          ...this.config.apiConfig,
        },
      };

      // 使用 API 获取翻译和替换信息
      const apiResult = await this.apiService.analyzeFullText(
        text,
        settingsForApi,
      );

      // 存入缓存
      this.cache.set(text, apiResult);

      return apiResult;
    } catch (error) {
      console.error('替换文本失败:', error);
      return {
        original: text,
        processed: text,
        replacements: [],
      };
    }
  }
}
