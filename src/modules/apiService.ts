/**
 * API 服务模块
 * 负责调用 GPT 大模型 API 进行文本分析和翻译
 */

import { getSystemPrompt } from './promptManager';
import { UserSettings, FullTextAnalysisResponse, Replacement, ApiConfig, DEFAULT_API_CONFIG } from './types';


// API 服务类
export class ApiService {
  private config: ApiConfig;

  constructor(config?: Partial<ApiConfig>) {
    this.config = { ...DEFAULT_API_CONFIG, ...config };
  }

  /**
   * 设置 API 配置
   * @param config API 配置
   */
  setConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 设置 API 密钥
   * @param apiKey API 密钥
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  /**
   * 设置 API 端点
   * @param endpoint API 端点
   */
  setApiEndpoint(endpoint: string): void {
    this.config.apiEndpoint = endpoint;
  }

  /**
   * 设置使用的模型
   * @param model 模型名称
   */
  setModel(model: string): void {
    this.config.model = model;
  }

  /**
   * 分析整个文本，识别并翻译句子中的特定部分
   * @param text 要分析的完整文本
   * @param settings 完整的用户设置对象
   * @returns 分析结果，包含替换信息
   */
  async analyzeFullText(text: string, settings: UserSettings): Promise<FullTextAnalysisResponse> {
    const originalText = text || '';

    // 验证输入
    if (!originalText.trim()) {
      return { original: originalText, processed: originalText, replacements: [] };
    }

    if (!settings.apiConfig.apiKey) {
      console.error('API 密钥未设置');
      return { original: originalText, processed: originalText, replacements: [] };
    }

    try {
      // 动态生成系统提示词
      const systemPrompt = getSystemPrompt(settings.translationDirection, settings.userLevel);

      const requestBody = {
        model: settings.apiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: originalText }
        ],
        temperature: settings.apiConfig.temperature,
        response_format: { type: 'json_object' }
      };

      const response = await fetch(settings.apiConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiConfig.apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`API 请求失败: ${response.status}`);
        return { original: originalText, processed: originalText, replacements: [] };
      }

      const data = await response.json();
      return this.extractReplacements(data, originalText);

    } catch (error) {
      console.error('API 请求或解析失败:', error);
      return { original: originalText, processed: originalText, replacements: [] };
    }
  }

  /**
   * 从API响应中提取替换信息
   * @param data API返回的数据
   * @param originalText 原始文本
   * @returns 分析结果，包含替换信息
   */
  private extractReplacements(data: any, originalText: string): FullTextAnalysisResponse {
    try {
      if (!data?.choices?.[0]?.message?.content) {
        return { original: originalText, processed: originalText, replacements: [] };
      }

      let content;
      try {
        content = JSON.parse(data.choices[0].message.content);
      } catch (parseError) {
        console.error('解析API响应JSON失败:', parseError);
        return { original: originalText, processed: originalText, replacements: [] };
      }

      if (!content || !Array.isArray(content.replacements)) {
        return { original: originalText, processed: originalText, replacements: [] };
      }

      const replacementsWithPositions = this.addPositionsToReplacements(originalText, content.replacements);

      return {
        original: originalText,
        processed: '', // 不再需要
        replacements: replacementsWithPositions
      };
    } catch (error) {
      console.error('提取替换信息失败:', error);
      return { original: originalText, processed: originalText, replacements: [] };
    }
  }

  /**
   * 为替换项添加位置信息
   * @param originalText 原始文本
   * @param replacements 从API获取的替换项
   * @returns 带位置信息的替换项数组
   */
  private addPositionsToReplacements(originalText: string, replacements: Array<{ original: string; translation: string }>): Replacement[] {
    const result: Replacement[] = [];
    let lastIndex = 0;

    // 假设API按顺序返回替换项
    for (const rep of replacements) {
      if (!rep.original || !rep.translation) continue;

      const index = originalText.indexOf(rep.original, lastIndex);
      if (index !== -1) {
        result.push({
          ...rep,
          position: {
            start: index,
            end: index + rep.original.length
          },
          isNew: true // 默认为生词
        });
        lastIndex = index + rep.original.length;
      } else {
        // Fallback: 如果按顺序找不到，则从头开始搜索
        const fallbackIndex = originalText.indexOf(rep.original);
        if (fallbackIndex !== -1) {
          result.push({
            ...rep,
            position: {
              start: fallbackIndex,
              end: fallbackIndex + rep.original.length
            },
            isNew: true
          });
        }
      }
    }
    return result;
  }
} 