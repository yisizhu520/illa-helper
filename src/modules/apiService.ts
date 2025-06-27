/**
 * API 服务模块
 * 负责调用 GPT 大模型 API 进行文本分析和翻译
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { getSystemPrompt, getSystemPromptByConfig } from './promptManager';
import {
  UserSettings,
  FullTextAnalysisResponse,
  Replacement,
  ApiConfig,
  DEFAULT_API_CONFIG,
  TranslationProvider,
  GeminiConfig,
  ApiConfigItem,
} from './types';
import {
  cleanMarkdownFromResponse,
  extractAndParseJson,
  getApiTimeout,
} from '@/src/utils';
import { rateLimitManager } from './rateLimit';

/**
 * 翻译提供者接口
 */
export interface ITranslationProvider {
  analyzeFullText(
    text: string,
    settings: UserSettings,
  ): Promise<FullTextAnalysisResponse>;
}

/**
 * 合并自定义参数到基础参数对象
 */
function mergeCustomParams(baseParams: any, customParamsJson?: string): any {
  // ... (此函数保持不变)
  const merged = { ...baseParams };
  const protectedKeys = ['model', 'messages', 'apiKey'];
  if (!customParamsJson?.trim()) return merged;
  try {
    const customParams = JSON.parse(customParamsJson);
    Object.entries(customParams).forEach(([key, value]) => {
      if (!protectedKeys.includes(key)) {
        merged[key] = value;
      } else {
        console.warn(`忽略受保护的参数: ${key}`);
      }
    });
  } catch (error) {
    console.warn('自定义参数JSON解析失败:', error);
  }
  return merged;
}

/**
 * 为替换项添加位置信息
 */
function addPositionsToReplacements(
  originalText: string,
  replacements: Array<{ original: string; translation: string }>,
): Replacement[] {
  // ... (此函数保持不变)
  const result: Replacement[] = [];
  let lastIndex = 0;
  for (const rep of replacements) {
    if (!rep.original || !rep.translation) continue;
    const index = originalText.indexOf(rep.original, lastIndex);
    if (index !== -1) {
      const foundText = originalText.substring(
        index,
        index + rep.original.length,
      );
      if (foundText === rep.original) {
        result.push({
          ...rep,
          position: { start: index, end: index + rep.original.length },
          isNew: true,
        });
        lastIndex = index + rep.original.length;
      }
    } else {
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
  result.sort((a, b) => a.position.start - b.position.start);
  return result;
}

class GoogleGeminiProvider implements ITranslationProvider {
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  async analyzeFullText(
    text: string,
    settings: UserSettings,
  ): Promise<FullTextAnalysisResponse> {
    const originalText = text || '';
    if (!originalText.trim() || !this.config.apiKey) {
      return { original: originalText, processed: originalText, replacements: [] };
    }

    try {
      const genAI = new GoogleGenerativeAI(this.config.apiKey);
      const model = genAI.getGenerativeModel({
        model: this.config.model,
        generationConfig: {
          responseMimeType: 'application/json',
        },
        // @ts-ignore
        // HACK: The official SDK doesn't directly support custom base URLs in a straightforward way.
        // This is an undocumented workaround to support proxying.
        // We are accessing a private property `_requestController` to modify the `baseUrl`.
        // This might break in future SDK updates.
        ...(this.config.apiEndpoint && {
          _requestController: {
            _getBaseUrl: () => this.config.apiEndpoint,
          },
        }),
      });

      const systemPrompt = getSystemPromptByConfig({
        translationDirection: 'intelligent',
        targetLanguage: settings.multilingualConfig.targetLanguage,
        userLevel: settings.userLevel,
        replacementRate: settings.replacementRate,
        intelligentMode: true,
        provider: 'gemini', // 指定为gemini获取特定prompt
      });

      const prompt = `${systemPrompt}\n\n${originalText}`;
      console.log('Gemini Prompt:', prompt);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      console.log('Gemini Response Text:', responseText);

      const content = extractAndParseJson(responseText);
      console.log('Parsed Gemini Content:', content);

      const replacements = addPositionsToReplacements(
        originalText,
        content.replacements || [],
      );

      return {
        original: originalText,
        processed: '',
        replacements,
      };
    } catch (error: any) {
      console.error('Google Gemini API请求失败:', error);
      return {
        original: originalText,
        processed: originalText,
        replacements: [],
      };
    }
  }
}

class OpenAIProvider implements ITranslationProvider {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async sendApiRequest(
    requestBody: any,
    apiConfig: ApiConfig,
    timeout: number | undefined = 30000,
  ): Promise<Response> {
    // ... (sendApiRequest logic from original ApiService)
    if (apiConfig.useBackgroundProxy) {
        return this.sendViaBackground(requestBody, apiConfig, timeout || 0);
      } else {
        const fetchOptions: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiConfig.apiKey}`,
          },
          body: JSON.stringify(requestBody),
        };
        if (timeout !== undefined) {
          fetchOptions.signal = AbortSignal.timeout(timeout);
        }
        return fetch(apiConfig.apiEndpoint, fetchOptions);
      }
  }

  private async sendViaBackground(
    requestBody: any,
    apiConfig: ApiConfig,
    timeout: number = 30000,
  ): Promise<Response> {
    // ... (sendViaBackground logic from original ApiService)
    return new Promise((resolve) => {
        browser.runtime.sendMessage(
          {
            type: 'api-request',
            data: {
              url: apiConfig.apiEndpoint,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiConfig.apiKey}`,
              },
              body: JSON.stringify(requestBody),
              timeout: timeout,
            },
          },
          (response) => {
            if (response.success) {
              const mockResponse = {
                ok: true, status: 200, statusText: 'OK',
                json: async () => response.data,
              } as Response;
              resolve(mockResponse);
            } else {
              const mockResponse = {
                ok: false,
                status: response.error?.status || 500,
                statusText: response.error?.statusText || 'Internal Server Error',
                json: async () => ({ error: response.error }),
              } as Response;
              resolve(mockResponse);
            }
          }
        );
      });
  }

  async analyzeFullText(
    text: string,
    settings: UserSettings,
  ): Promise<FullTextAnalysisResponse> {
    // ... (analyzeFullText logic from original ApiService, adapted to use this.config)
    const originalText = text || '';
    if (!originalText.trim() || !this.config.apiKey) {
        return { original: originalText, processed: originalText, replacements: [] };
    }

    try {
        const useIntelligentMode = settings.multilingualConfig?.intelligentMode || settings.translationDirection === 'intelligent';
        const systemPrompt = useIntelligentMode
            ? getSystemPromptByConfig({
                translationDirection: 'intelligent',
                targetLanguage: settings.multilingualConfig.targetLanguage,
                userLevel: settings.userLevel,
                replacementRate: settings.replacementRate,
                intelligentMode: true,
              })
            : getSystemPrompt(settings.translationDirection, settings.userLevel, settings.replacementRate);

        let requestBody: any = {
            model: this.config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `{{ ${originalText} }}` },
            ],
            temperature: this.config.temperature,
            response_format: { type: 'json_object' },
        };

        if (this.config.includeThinkingParam) {
            requestBody.enable_thinking = this.config.enable_thinking;
        }
        requestBody = mergeCustomParams(requestBody, this.config.customParams);

        const rateLimiter = rateLimitManager.getLimiter(this.config.apiEndpoint, this.config.requestsPerSecond || 0, true);
        const apiRequestFunction = async () => {
            const timeout = getApiTimeout(settings.apiRequestTimeout || 30000);
            return this.sendApiRequest(requestBody, this.config, timeout);
        };

        const [response] = await rateLimiter.executeBatch([apiRequestFunction]);

        if (!response.ok) {
            console.error(`API 请求失败: ${response.status} ${response.statusText}`);
            return { original: originalText, processed: originalText, replacements: [] };
        }

        const data = await response.json();
        return this.extractReplacements(data, originalText);

    } catch (error: any) {
        console.error('API请求失败:', error);
        return { original: originalText, processed: originalText, replacements: [] };
    }
  }

  private extractReplacements(
    data: any,
    originalText: string,
  ): FullTextAnalysisResponse {
    // ... (extractIntelligentReplacements and extractReplacements logic combined and simplified)
    try {
        if (!data?.choices?.[0]?.message?.content) {
            return { original: originalText, processed: originalText, replacements: [] };
        }
        const cleanedContent = cleanMarkdownFromResponse(data.choices[0].message.content);
        const content = JSON.parse(cleanedContent);
        const replacements = addPositionsToReplacements(originalText, content.replacements || []);
        return { original: originalText, processed: '', replacements };
    } catch (error) {
        console.error('提取替换信息失败:', error);
        return { original: originalText, processed: originalText, replacements: [] };
    }
  }
}

// API 服务工厂
export class ApiService {
  static createProvider(
    activeConfig: ApiConfigItem,
  ): ITranslationProvider {
    const { provider, config } = activeConfig;

    switch (provider) {
      case TranslationProvider.GoogleGemini:
      case TranslationProvider.ProxyGemini:
        // The distinction between GoogleGemini and ProxyGemini is handled by the apiEndpoint in the config.
        const geminiConfig: GeminiConfig = {
          apiKey: config.apiKey,
          model: config.model,
          apiEndpoint: provider === TranslationProvider.ProxyGemini ? config.apiEndpoint : undefined,
        };
        return new GoogleGeminiProvider(geminiConfig);

      case TranslationProvider.OpenAI:
      case TranslationProvider.DeepSeek:
      case TranslationProvider.SiliconFlow:
      default:
        return new OpenAIProvider(config);
    }
  }
}
