/**
 * API 服务模块
 * 负责调用 GPT 大模型 API 进行文本分析和翻译
 */

import { getSystemPrompt, getSystemPromptByConfig } from './promptManager';
import {
  UserSettings,
  FullTextAnalysisResponse,
  Replacement,
  ApiConfig,
  DEFAULT_API_CONFIG,
} from './types';
import { cleanMarkdownFromResponse } from '@/src/utils';

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
   * 设置 API 端点
   * @param apiEndpoint API 端点 URL
   */
  setApiEndpoint(apiEndpoint: string): void {
    this.config.apiEndpoint = apiEndpoint;
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
   * 支持智能模式和传统模式
   * @param text 要分析的完整文本
   * @param settings 完整的用户设置对象
   * @returns 分析结果，包含替换信息和语言检测结果
   */
  async analyzeFullText(
    text: string,
    settings: UserSettings,
  ): Promise<FullTextAnalysisResponse> {
    const originalText = text || '';

    // 验证输入
    if (!originalText.trim() || !settings.apiConfig.apiKey) {
      return {
        original: originalText,
        processed: originalText,
        replacements: [],
      };
    }

    if (!settings.apiConfig.apiKey) {
      console.error('API 密钥未设置');
    }
    try {
      // 判断是否使用智能模式
      const useIntelligentMode =
        settings.multilingualConfig?.intelligentMode ||
        settings.translationDirection === 'intelligent';

      let systemPrompt: string;

      if (useIntelligentMode) {
        // 使用智能模式提示词，直接使用用户选择的目标语言
        const targetLanguage = settings.multilingualConfig?.targetLanguage;

        if (!targetLanguage) {
          console.error('智能模式下未找到目标语言配置');
          return {
            original: originalText,
            processed: originalText,
            replacements: [],
          };
        }

        systemPrompt = getSystemPromptByConfig({
          translationDirection: 'intelligent',
          targetLanguage: targetLanguage,
          userLevel: settings.userLevel,
          replacementRate: settings.replacementRate,
          intelligentMode: true,
        });
      } else {
        // 使用传统模式提示词
        systemPrompt = getSystemPrompt(
          settings.translationDirection,
          settings.userLevel,
          settings.replacementRate,
        );
      }

      const requestBody = {
        model: settings.apiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `{{ ${originalText} }}`,
          },
        ],
        temperature: settings.apiConfig.temperature,
        response_format: { type: 'json_object' },
        enable_thinking: settings.apiConfig.enable_thinking,
      };

      const response = await fetch(settings.apiConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiConfig.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`API 请求失败: ${response.status}`);
        return {
          original: originalText,
          processed: originalText,
          replacements: [],
        };
      }

      const data = await response.json();

      if (useIntelligentMode) {
        return this.extractIntelligentReplacements(
          data,
          originalText,
          settings,
        );
      } else {
        return this.extractReplacements(data, originalText);
      }
    } catch (error) {
      console.error('API 请求或解析失败:', error);
      return {
        original: originalText,
        processed: originalText,
        replacements: [],
      };
    }
  }

  /**
   * 极简化：提取智能模式的替换信息
   * 只关注replacements数组，忽略其他所有信息
   * @param data API返回的数据
   * @param originalText 原始文本
   * @param settings 用户设置
   * @returns 分析结果，只包含replacements
   */
  private extractIntelligentReplacements(
    data: any,
    originalText: string,
    settings: UserSettings,
  ): FullTextAnalysisResponse {
    try {
      if (!data?.choices?.[0]?.message?.content) {
        return {
          original: originalText,
          processed: '',
          replacements: [],
        };
      }

      let content;
      try {
        // 清理AI响应中的Markdown格式
        const cleanedContent = cleanMarkdownFromResponse(
          data.choices[0].message.content,
        );
        content = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('解析智能模式API响应JSON失败:', parseError);
        console.error('原始响应内容:', data.choices[0].message.content);
        // 降级到传统模式处理
        return this.extractReplacements(data, originalText);
      }

      // 只处理replacements数组
      const replacements = this.addPositionsToReplacements(
        originalText,
        content.replacements || [],
      );

      return {
        original: originalText,
        processed: '',
        replacements,
      };
    } catch (error) {
      console.error('提取智能替换信息失败:', error);
      // 降级处理
      return this.extractReplacements(data, originalText);
    }
  }

  /**
   * 保持向后兼容：从传统模式API响应中提取替换信息
   * @param data API返回的数据
   * @param originalText 原始文本
   * @returns 分析结果，包含替换信息
   */
  private extractReplacements(
    data: any,
    originalText: string,
  ): FullTextAnalysisResponse {
    try {
      if (!data?.choices?.[0]?.message?.content) {
        return {
          original: originalText,
          processed: originalText,
          replacements: [],
        };
      }

      let content;
      try {
        // 清理AI响应中的Markdown格式
        const cleanedContent = cleanMarkdownFromResponse(
          data.choices[0].message.content,
        );
        content = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('解析API响应JSON失败:', parseError);
        console.error('原始响应内容:', data.choices[0].message.content);
        return {
          original: originalText,
          processed: originalText,
          replacements: [],
        };
      }

      if (!content || !Array.isArray(content.replacements)) {
        return {
          original: originalText,
          processed: originalText,
          replacements: [],
        };
      }

      const replacementsWithPositions = this.addPositionsToReplacements(
        originalText,
        content.replacements,
      );

      return {
        original: originalText,
        processed: '', // 不再需要
        replacements: replacementsWithPositions,
      };
    } catch (error) {
      console.error('提取替换信息失败:', error);
      return {
        original: originalText,
        processed: originalText,
        replacements: [],
      };
    }
  }


  /**
   * 为替换项添加位置信息
   * @param originalText 原始文本
   * @param replacements 从API获取的替换项
   * @returns 带位置信息的替换项数组
   */
  private addPositionsToReplacements(
    originalText: string,
    replacements: Array<{ original: string; translation: string }>,
  ): Replacement[] {
    const result: Replacement[] = [];
    let lastIndex = 0;

    // 按顺序处理替换项，支持重复词汇
    for (const rep of replacements) {
      if (!rep.original || !rep.translation) {
        continue;
      }

      // 尝试在剩余文本中查找词汇
      const index = originalText.indexOf(rep.original, lastIndex);
      if (index !== -1) {
        // 验证找到的文本确实匹配
        const foundText = originalText.substring(
          index,
          index + rep.original.length,
        );
        if (foundText === rep.original) {
          result.push({
            ...rep,
            position: {
              start: index,
              end: index + rep.original.length,
            },
            isNew: true,
          });
          lastIndex = index + rep.original.length;
        }
      } else {
        // 如果顺序查找失败，尝试全局查找（但要避免重复）
        const globalIndex = originalText.indexOf(rep.original);
        if (
          globalIndex !== -1 &&
          !result.some(
            (r) =>
              r.position.start <= globalIndex && r.position.end > globalIndex,
          )
        ) {
          result.push({
            ...rep,
            position: {
              start: globalIndex,
              end: globalIndex + rep.original.length,
            },
            isNew: true,
          });
        }
      }
    }

    // 按位置排序确保处理顺序正确
    result.sort((a, b) => a.position.start - b.position.start);

    return result;
  }
}
