import {
  IEnhancementProvider,
  ContentContext,
  Enhancement,
  EnhancementCategory,
} from '../core/types';
import { UniversalApiService } from '../../api/services/UniversalApiService';

export class WritingAssistantProvider implements IEnhancementProvider {
  readonly id = 'writing-assistant';
  readonly name = '写作能力提升助手';
  readonly description = '分析文本质量，提供改进建议和写作技巧';
  readonly categories: EnhancementCategory[] = ['writing'];

  constructor(private apiService: UniversalApiService) {}

  /**
   * 检查内容是否适用于写作增强
   */
  async isApplicable(context: ContentContext): Promise<boolean> {
    // 检查输入是否有效
    if (!context || !context.text || typeof context.text !== 'string') {
      console.log('WritingAssistant: Invalid context or text');
      return false;
    }

    // 检查文本长度 - 至少需要一个完整句子
    if (context.text.length < 20) {
      console.log('WritingAssistant: Text too short:', context.text.length);
      return false;
    }

    // 检查是否包含完整句子（有标点符号）
    const sentencePattern = /[.!?。！？]/;
    if (!sentencePattern.test(context.text.trim())) {
      console.log('WritingAssistant: No sentence ending found');
      return false;
    }

    // 避免处理代码块
    if (this.isCodeBlock(context.text)) {
      console.log('WritingAssistant: Code block detected');
      return false;
    }

    // 检查是否是有意义的文本内容
    const isMeaningful = this.isMeaningfulText(context.text);
    console.log('WritingAssistant: Text meaningful check:', isMeaningful);
    console.log('WritingAssistant: Text sample:', context.text.substring(0, 100) + '...');
    
    return isMeaningful;
  }

  /**
   * 生成写作增强建议
   */
  async enhance(context: ContentContext): Promise<Enhancement[]> {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(context.text);
      console.log('📝 WritingAssistant: 发送分析请求...');
      
      // 使用 UniversalApiService 的 call 方法
      const result = await this.apiService.call(analysisPrompt, {
        systemPrompt: '你是一个专业的中文写作指导老师，擅长分析文本质量并提供实用的改进建议。',
        temperature: 0.7,
        maxTokens: 1500
      });

      if (!result.success) {
        console.error('WritingAssistant API调用失败:', result.error);
        return [];
      }

      console.log('✅ WritingAssistant: API响应成功');
      console.log('📄 响应内容:', result.content);

      const suggestions = this.parseApiResponse(result.content);
      console.log(`🔍 WritingAssistant: 解析出 ${suggestions.length} 个建议`);

      return suggestions.map((suggestion, index) => ({
        id: `${this.id}-${context.elementId}-${index}`,
        type: 'writing' as const,
        title: suggestion.title,
        content: suggestion.content,
        confidence: suggestion.confidence,
        context: {
          ...context,
          additionalData: {
            analysisType: suggestion.type,
            originalText: context.text,
          },
        },
      }));
    } catch (error) {
      console.error('WritingAssistantProvider enhancement failed:', error);
      return [];
    }
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(text: string): string {
    return `作为专业的写作指导老师，请分析以下文本的写作质量，并提供具体的改进建议。

原文：
"${text}"

请按照以下格式提供分析，每个建议用"---"分隔：

建议类型: [语法/表达/结构/词汇/其他]
标题: [简洁的建议标题]
内容: [具体的改进建议，包含实例]
可信度: [0.1-1.0之间的数值]
---

要求：
1. 最多提供3个最重要的建议
2. 建议要具体、实用，避免泛泛而谈
3. 如果文本质量很好，可以提供进阶优化建议
4. 可信度反映建议的重要性和适用性
5. 用中文回答`;
  }

  /**
   * 解析API响应
   */
  private parseApiResponse(response: string): WritingSuggestion[] {
    const suggestions: WritingSuggestion[] = [];

    try {
      const parts = response.split('---').filter((part) => part.trim());

      for (const part of parts) {
        const lines = part
          .trim()
          .split('\n')
          .filter((line) => line.trim());

        let type = '';
        let title = '';
        let content = '';
        let confidence = 0.8;

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('建议类型:')) {
            type = trimmedLine.replace('建议类型:', '').trim();
          } else if (trimmedLine.startsWith('标题:')) {
            title = trimmedLine.replace('标题:', '').trim();
          } else if (trimmedLine.startsWith('内容:')) {
            content = trimmedLine.replace('内容:', '').trim();
          } else if (trimmedLine.startsWith('可信度:')) {
            const confStr = trimmedLine.replace('可信度:', '').trim();
            confidence = parseFloat(confStr) || 0.8;
          } else if (
            !trimmedLine.startsWith('建议类型:') &&
            !trimmedLine.startsWith('标题:') &&
            !trimmedLine.startsWith('内容:') &&
            !trimmedLine.startsWith('可信度:') &&
            content
          ) {
            // 继续添加到内容中
            content += ' ' + trimmedLine;
          }
        }

        if (title && content) {
          suggestions.push({
            type: type || '表达',
            title,
            content,
            confidence: Math.max(0.1, Math.min(1.0, confidence)),
          });
        }
      }
    } catch (error) {
      console.error('Failed to parse writing suggestions:', error);
    }

    return suggestions.slice(0, 3); // 最多返回3个建议
  }

  /**
   * 检查是否是代码块
   */
  private isCodeBlock(text: string): boolean {
    // 检查常见代码模式
    const codePatterns = [
      /function\s*\(/,
      /class\s+\w+/,
      /import\s+.*from/,
      /console\.log/,
      /\$\(/,
      /<\w+[^>]*>/,  // 更严格的HTML标签检测
      /{\s*[\w\s]*:\s*[\w\s]*}/,
      /\/\*.*\*\//,
      /\/\/.*$/m,
    ];

    const isCode = codePatterns.some((pattern) => pattern.test(text));
    console.log('WritingAssistant: Code block check:', isCode);
    if (isCode) {
      const matchedPattern = codePatterns.find(pattern => pattern.test(text));
      console.log('WritingAssistant: Matched pattern:', matchedPattern);
      console.log('WritingAssistant: Text sample:', text.substring(0, 200));
    }
    return isCode;
  }

  /**
   * 检查是否是有意义的文本
   */
  private isMeaningfulText(text: string): boolean {
    // 检查输入是否有效
    if (!text || typeof text !== 'string') {
      return false;
    }

    // 过滤掉纯数字、纯符号、链接等
    const meaninglessPatterns = [
      /^[\d\s\-+.,%]+$/, // 纯数字和符号
      /^https?:\/\//, // 链接
      /^[^\w\u4e00-\u9fa5]+$/, // 不包含字母或中文的文本
      /^[\s]*$/, // 空白文本
    ];

    if (meaninglessPatterns.some((pattern) => pattern.test(text))) {
      return false;
    }

    // 检查是否包含足够的文字内容
    const matches = text.match(/[\u4e00-\u9fa5\w]+/g);
    const wordCount = matches ? matches.length : 0;
    return wordCount >= 3;
  }
}

/**
 * 写作建议接口
 */
interface WritingSuggestion {
  type: string;
  title: string;
  content: string;
  confidence: number;
}
